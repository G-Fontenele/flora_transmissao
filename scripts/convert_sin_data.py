import openpyxl
import csv
import json
import os
import math
import hashlib

def get_hash_float(seed_str, min_val, max_val):
    h = int(hashlib.md5(seed_str.encode('utf-8')).hexdigest()[:8], 16)
    normalized = (h % 10000) / 10000.0
    return round(min_val + normalized * (max_val - min_val), 2)

def get_hash_int(seed_str, min_val, max_val):
    h = int(hashlib.md5(seed_str.encode('utf-8')).hexdigest()[:8], 16)
    return min_val + (h % (max_val - min_val + 1))

def run_conversion():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    csv_path = os.path.join(base_dir, 'SUBESTACAO.csv')
    xlsx_path = os.path.join(base_dir, 'LINHA_TRANSMISSAO.xlsx')
    
    out_dir = os.path.join(base_dir, 'src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    
    print("1. Lendo SUBESTACAO.csv...")
    subs_by_barra = {}
    substations_map = {} # by id_subestacao to get unique SE list
    
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader) # header
        for row in reader:
            if len(row) < 12:
                continue
            num_barra = row[9].strip()
            try:
                lat = float(row[10].replace(',', '.'))
                lon = float(row[11].replace(',', '.'))
                tensao = float(row[7].replace(',', '.'))
            except ValueError:
                continue
            
            id_sub = row[5].strip()
            nom_sub = row[6].strip()
            id_estado = row[2].strip()
            nom_estado = row[3].strip()
            subsistema = row[1].strip()
            
            se_info = {
                'id': id_sub,
                'name': nom_sub,
                'state': id_estado,
                'stateName': nom_estado,
                'subsystem': subsistema,
                'lat': lat,
                'lon': lon,
                'voltageLevel': tensao
            }
            if num_barra:
                subs_by_barra[num_barra] = se_info
            
            if id_sub not in substations_map:
                substations_map[id_sub] = se_info
            else:
                if tensao > substations_map[id_sub]['voltageLevel']:
                    substations_map[id_sub]['voltageLevel'] = tensao

    substations_list = list(substations_map.values())
    print(f"   -> {len(substations_list)} subestações únicas geolocalizadas.")
    
    print("2. Lendo LINHA_TRANSMISSAO.xlsx...")
    wb = openpyxl.load_workbook(xlsx_path, read_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    data = rows[1:]
    
    lines_list = []
    all_spans = []
    
    matched_count = 0
    skipped_inactive = 0
    skipped_voltage = 0
    skipped_no_coords = 0
    
    for r in data:
        # Check active
        if r[17] is not None:
            skipped_inactive += 1
            continue
        
        # Check voltage level >= 230
        try:
            tensao_kv = int(r[10])
        except (ValueError, TypeError):
            try:
                tensao_kv = int(float(r[10]))
            except:
                tensao_kv = 0
        
        if tensao_kv < 230:
            skipped_voltage += 1
            continue
            
        barra_de = str(r[35]).strip() if r[35] else ''
        barra_para = str(r[36]).strip() if r[36] else ''
        
        se_de = subs_by_barra.get(barra_de)
        se_para = subs_by_barra.get(barra_para)
        
        if not se_de or not se_para:
            skipped_no_coords += 1
            continue
            
        matched_count += 1
        
        cod_equipamento = str(r[15]).strip() if r[15] else f"LT-{matched_count}"
        nome_linha = str(r[14]).strip() if r[14] else f"LT {tensao_kv} kV {se_de['name']} / {se_para['name']}"
        tipo_rede = str(r[11]).strip() if r[11] else 'BASICA'
        agente = str(r[13]).strip() if r[13] else 'ONS/SIN'
        
        try:
            comp_km = float(r[19])
            if comp_km <= 0:
                # Euclidean approx: 1 deg lat ~ 111km
                dlat = (se_para['lat'] - se_de['lat']) * 111.0
                dlon = (se_para['lon'] - se_de['lon']) * 111.0 * math.cos(math.radians(se_de['lat']))
                comp_km = round(math.sqrt(dlat*dlat + dlon*dlon), 1)
        except (ValueError, TypeError):
            dlat = (se_para['lat'] - se_de['lat']) * 111.0
            dlon = (se_para['lon'] - se_de['lon']) * 111.0 * math.cos(math.radians(se_de['lat']))
            comp_km = round(math.sqrt(dlat*dlat + dlon*dlon), 1)
            
        subsistema = str(r[1]).strip() if r[1] else se_de['subsystem']
        estado_de = str(r[4]).strip() if r[4] else se_de['state']
        estado_para = str(r[6]).strip() if r[6] else se_para['state']
        
        # Generate spans for this line
        # Use 1 span per ~15 km, min 1, max 8
        num_spans = max(1, min(8, int(round(comp_km / 18.0))))
        span_length = round(comp_km / num_spans, 1)
        
        line_spans = []
        for i in range(num_spans):
            t0 = i / num_spans
            t1 = (i + 1) / num_spans
            
            lat_start = round(se_de['lat'] + (se_para['lat'] - se_de['lat']) * t0, 4)
            lon_start = round(se_de['lon'] + (se_para['lon'] - se_de['lon']) * t0, 4)
            lat_end = round(se_de['lat'] + (se_para['lat'] - se_de['lat']) * t1, 4)
            lon_end = round(se_de['lon'] + (se_para['lon'] - se_de['lon']) * t1, 4)
            
            span_id = f"{cod_equipamento}-V{i+1}"
            seed = f"{span_id}-{lat_start}-{lon_start}"
            
            vi = get_hash_float(seed + "vi", 0.12, 0.95)
            cr = round(min(0.96, max(0.08, vi * 0.90 + get_hash_float(seed + "cr", -0.10, 0.15))), 2)
            gr30d = get_hash_int(seed + "gr", 3, 42)
            recurrence = get_hash_float(seed + "rec", 0.10, 0.85)
            urgency = 0.85 if cr > 0.72 else 0.25
            
            # Priority score formula: 35% VI + 25% CR + 20% (GR/30) + 10% Rec + 10% Urg
            p_score = int(min(100, max(0, round(
                35 * vi + 25 * cr + 20 * (min(30, gr30d)/30.0) + 10 * recurrence + 10 * urgency
            ))))
            
            if p_score >= 80:
                status = 'Critica'
                action = 'Roçada Mecanizada Emergencial + Podas de Copa (<72h)'
            elif p_score >= 60:
                status = 'Alta'
                action = 'Inclusão em Ciclo Mensal Prioritário de Roçada'
            elif p_score >= 40:
                status = 'Atencao'
                action = 'Inspeção Preventiva e Planejamento Quinzenal'
            else:
                status = 'Normal'
                action = 'Monitoramento Satelital Regular (Faixa em Conformidade)'
                
            cost = int(round(span_length * 4800 * (1 + (vi - 0.5) * 0.5)))
            
            span_obj = {
                'id': span_id,
                'lineId': cod_equipamento,
                'lineName': nome_linha,
                'startTower': f"SE {se_de['name']}" if i == 0 else f"Torre {i*10}",
                'endTower': f"SE {se_para['name']}" if i == num_spans - 1 else f"Torre {(i+1)*10}",
                'region': f"Região {subsistema} ({estado_de})",
                'lengthKm': span_length,
                'latitude': (lat_start + lat_end) / 2,
                'longitude': (lon_start + lon_end) / 2,
                'latStart': lat_start,
                'lonStart': lon_start,
                'latEnd': lat_end,
                'lonEnd': lon_end,
                'vegetationIndex': vi,
                'growth15d': int(gr30d * 0.48),
                'growth30d': gr30d,
                'growth90d': int(gr30d * 2.3),
                'clearanceRisk': cr,
                'priorityScore': p_score,
                'recurrenceScore': recurrence,
                'urgencyScore': urgency,
                'lastInspectionDate': '2026-06-25',
                'lastMowingDate': '2026-03-12' if i % 2 == 0 else '2025-11-20',
                'status': status,
                'recommendedAction': action,
                'estimatedCost': cost,
                'estimatedDurationHours': max(2, int(round(span_length * 7))),
                'state': estado_de,
                'subsystem': subsistema
            }
            line_spans.append(span_obj)
            all_spans.append(span_obj)
            
        lines_list.append({
            'id': cod_equipamento,
            'name': nome_linha,
            'voltageKv': tensao_kv,
            'networkType': tipo_rede,
            'ownerAgent': agente,
            'lengthKm': comp_km,
            'subsystem': subsistema,
            'stateDe': estado_de,
            'statePara': estado_para,
            'substationDe': se_de['name'],
            'substationPara': se_para['name'],
            'latDe': se_de['lat'],
            'lonDe': se_de['lon'],
            'latPara': se_para['lat'],
            'lonPara': se_para['lon'],
            'operationDate': str(r[16])[:10] if r[16] else 'N/A',
            'spans': line_spans
        })
        
    print(f"3. Resumo da conversão:")
    print(f"   -> Linhas processadas e geolocalizadas: {len(lines_list)}")
    print(f"   -> Vãos simulados gerados: {len(all_spans)}")
    print(f"   -> Desativadas puladas: {skipped_inactive}")
    print(f"   -> Tensão < 230kV puladas: {skipped_voltage}")
    print(f"   -> Sem coordenadas puladas: {skipped_no_coords}")
    
    substations_out = os.path.join(out_dir, 'substations.json')
    lines_out = os.path.join(out_dir, 'transmissionLines.json')
    
    with open(substations_out, 'w', encoding='utf-8') as f:
        json.dump(substations_list, f, ensure_ascii=False, indent=1)
        
    with open(lines_out, 'w', encoding='utf-8') as f:
        json.dump(lines_list, f, ensure_ascii=False, indent=1)
        
    print("4. Arquivos JSON gravados com sucesso em src/data/!")

if __name__ == '__main__':
    run_conversion()
