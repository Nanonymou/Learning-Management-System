#!/usr/bin/env python3
"""Ingest DOCX materi -> struktur chapter/block (JSON).

Materi ditampilkan APA ADANYA (isi teks tidak diubah); skrip ini hanya
mengklasifikasikan tiap paragraf ke tipe blok untuk render e-book.

Usage: python3 ingest-docx.py <path.docx> <out.json>
Deteksi: numPr (list), bold (heading), prefix centang (check), °C (temperature).
"""
import sys, json, re, zipfile
from collections import Counter
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
ROMAN = re.compile(r'^BAB\s+[IVXLCDM]+$')


def paragraphs(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    rows = []
    for p in root.iter(W + 'p'):
        ppr = p.find(W + 'pPr')
        is_num = ppr is not None and ppr.find(W + 'numPr') is not None
        bold = False
        r = p.find(W + 'r')
        if r is not None:
            rpr = r.find(W + 'rPr')
            if rpr is not None and rpr.find(W + 'b') is not None:
                bold = True
        text = ''.join(t.text or '' for t in p.iter(W + 't')).strip()
        rows.append((text, is_num, bold))
    return rows


def classify(text, is_num, bold):
    if text and text[0] in '✔✅':
        return ('check', text[1:].strip(), True)
    if text and text[0] == '✘':
        return ('check', text[1:].strip(), False)
    if text.startswith('"') or text.startswith('“'):
        return ('quote', text, None)
    if '°C' in text:
        return ('temperature', text, None)
    if bold and not is_num:
        return ('heading', text, None)
    if is_num:
        return ('list', text, None)
    return ('paragraph', text, None)


def group(raw):
    result, i, n = [], 0, len(raw)
    while i < n:
        kind, text, ok = raw[i]
        if kind in ('heading', 'paragraph', 'quote'):
            key = 'heading' if kind == 'heading' else kind
            result.append({'type': key, 'text': text}); i += 1
        elif kind == 'list':
            items = []
            while i < n and raw[i][0] == 'list':
                items.append(raw[i][1]); i += 1
            result.append({'type': 'list_bullet', 'items': items})
        elif kind == 'temperature':
            items = []
            while i < n and raw[i][0] == 'temperature':
                items.append(raw[i][1]); i += 1
            result.append({'type': 'temperature', 'items': items})
        elif kind == 'check':
            cur_ok, items = ok, []
            while i < n and raw[i][0] == 'check' and raw[i][2] == cur_ok:
                items.append(raw[i][1]); i += 1
            result.append({'type': 'list_check', 'ok': cur_ok, 'items': items})
        else:
            i += 1
    return result


def main():
    src, out = sys.argv[1], sys.argv[2]
    rows = paragraphs(src)
    chapters, cur, raw = [], None, []
    i, n = 0, len(rows)

    def flush():
        if cur is not None:
            cur['blocks'] = group(raw)
            chapters.append(cur)

    while i < n:
        text, is_num, bold = rows[i]
        if not text:
            i += 1; continue
        if ROMAN.match(text):
            flush()
            code = text.replace('BAB', '').strip()
            j = i + 1
            while j < n and not rows[j][0]:
                j += 1
            title = rows[j][0] if j < n else ''
            cur, raw = {'code': code, 'title': title}, []
            i = j + 1
            continue
        if cur is None:
            i += 1; continue
        raw.append(classify(text, is_num, bold))
        i += 1
    flush()

    data = []
    for idx, ch in enumerate(chapters, 1):
        cid = f'bab-{idx}'
        for bi, b in enumerate(ch['blocks'], 1):
            b['id'] = f'{cid}-b{bi}'
        data.append({'id': cid, 'order': idx, 'code': ch['code'],
                     'title': ch['title'], 'blocks': ch['blocks']})
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    tc = Counter(b['type'] for ch in data for b in ch['blocks'])
    print(f'Chapters: {len(data)}  Blocks: {sum(len(c["blocks"]) for c in data)}')
    print('Block types:', dict(tc))
    print('Titles:', [f"{c['code']}:{c['title'][:24]}" for c in data])


if __name__ == '__main__':
    main()
