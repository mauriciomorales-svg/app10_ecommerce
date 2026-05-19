from pathlib import Path

path = Path(__file__).resolve().parents[1] / "app/Http/Controllers/Api/OrderTicketController.php"
c = path.read_text(encoding="utf-8")

start = c.find("  <div class=\"inventory\">")
end = c.find("  <motion.div class=\"footer\">")
if end == -1:
    end = c.find('  <div class="footer">')

if start != -1 and end != -1:
    block = (
        '  <div class="inventory">\n'
        '    <h3>PRODUCTOS (ESTANTER&Iacute;A):</h3>\n'
        '    {$inventarioHtml}\n'
        '  </div>\n\n'
        '  <div class="inventory" style="background:#e8f4fd;border-color:#90caf9">\n'
        '    <h3>MATERIAL DE EMPAQUE:</h3>\n'
        '    {$packagingHtml}\n'
        '  </div>\n\n'
        '  <div class="total">TOTAL: <span>\\${$total}</span></div>\n\n'
    )
    c = c[:start] + block + c[end:]
    path.write_text(c, encoding="utf-8")
    print("ok")
else:
    print("markers not found", start, end)
