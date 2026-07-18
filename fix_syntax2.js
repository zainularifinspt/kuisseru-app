const fs = require('fs');
['src/app/admin/page.tsx', 'src/app/teacher/page.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Remove the bad closing tags inside the dashboard tab
  code = code.replace(
    /        <\/div>\n        <\/div>\n      <\/>\n        \)\}\n/g,
    "      </>\n        )}\n"
  );
  
  // Also fix the case where </main> was already removed by my previous script
  // Wait, I had:
  // </div>
  // </div>
  // </>
  // )
  // Let's just find `</>` and `)}` and place the `</div></div></main>` at the end.
  // Actually, let's just find `{/* BottomNavBar (Mobile Only) */}` or `{/* BottomNavBar (Mobile Only) */}` and insert `</div></div></main>` before it.
  
  code = code.replace(
    /      \{\/\* BottomNavBar \(Mobile Only\) \*\/\}/,
    "        </div>\n      </main>\n\n      {/* BottomNavBar (Mobile Only) */}"
  );
  
  // Wait, the inner div `max-w-6xl` needs closing too.
  code = code.replace(
    /        <\/div>\n      <\/main>\n\n      \{\/\* BottomNavBar \(Mobile Only\) \*\/\}/,
    "        </div>\n        </div>\n      </main>\n\n      {/* BottomNavBar (Mobile Only) */}"
  );

  fs.writeFileSync(file, code);
  console.log("Fixed", file);
});
