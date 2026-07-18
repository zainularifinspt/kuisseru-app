const fs = require('fs');
['src/app/admin/page.tsx', 'src/app/teacher/page.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Find where the syntax error starts
  let dashboardStr = "{activeTab === 'dashboard' && (\\n          <>\\n";
  
  code = code.replace(
    /<\/main>\s*<\/>\s*\)\}/g,
    "</>\n        )}\n"
  );
  code = code.replace(
    /\{activeTab === 'pengaturan' && \([\s\S]*?\)\}\n/g,
    match => match + "      </main>\n"
  );
  
  fs.writeFileSync(file, code);
  console.log("Fixed", file);
});
