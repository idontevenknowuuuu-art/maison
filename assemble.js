const fs = require('fs');
let html = fs.readFileSync('furniture_no_script.html', 'utf8');
const js = fs.readFileSync('clean_script.js', 'utf8');

const supabaseScript = `
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
${js}
</script>
</body>
</html>`;

html = html.split('</body>')[0] + supabaseScript;
fs.writeFileSync('furniture.html', html);
console.log('✅ furniture.html rebuilt successfully (' + html.length + ' bytes)');
