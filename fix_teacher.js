const fs = require('fs');
let code = fs.readFileSync('src/app/teacher/page.tsx', 'utf-8');

// 1. State
code = code.replace(
  /const \[isEditProfileOpen, setIsEditProfileOpen\] = useState\(false\);/,
  "const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);\n  const [activeTab, setActiveTab] = useState<'dashboard' | 'pengaturan'>('dashboard');"
);

// 2. Remove dashboard modal
let dashboardModalStart = code.indexOf('{/* Profile Edit Modal */}', code.indexOf('// ── DASHBOARD SCREEN ──'));
let dashboardModalEnd = code.indexOf('{/* Mobile Sidebar Overlay */}');
let profileFormStr = code.substring(dashboardModalStart, dashboardModalEnd);
let profileFormInner = profileFormStr.match(/<form[\s\S]*?<\/form>/)[0];
// Update button inside profile form
profileFormInner = profileFormInner.replace(
  /onClick=\{\(\) => setIsEditProfileOpen\(false\)\}/,
  "onClick={() => setActiveTab('dashboard')}"
);

code = code.substring(0, dashboardModalStart) + code.substring(dashboardModalEnd);

// 3. Update callback
code = code.replace(
  /setIsEditProfileOpen\(false\);\n      window\.location\.reload\(\);/,
  "setActiveTab('dashboard');\n      window.location.reload();"
);

// 4. Sidebar links
code = code.replace(
  /<Link href="\/teacher" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white\/10 transition-colors duration-200 cursor-pointer">/g,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'dashboard' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);
// Fix the closing link for dashboard inside the sidebar
code = code.replace(/Dashboard\n\s*<\/Link>/, "Dashboard\n            </button>");

code = code.replace(
  /<button onClick=\{\(\) => setIsEditProfileOpen\(true\)\} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant\/70 font-heading font-bold text-sm hover:bg-white\/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'pengaturan' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);

// 5. BottomNavBar links
code = code.replace(
  /<Link href="\/teacher" className="flex flex-col items-center gap-1 text-electric-blue">/g,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex flex-col items-center gap-1 \${activeTab === 'dashboard' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);
code = code.replace(/Home\n\s*<\/Link>/, "Home\n        </button>");

code = code.replace(
  /<button onClick=\{\(\) => setIsEditProfileOpen\(true\)\} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex flex-col items-center gap-1 \${activeTab === 'pengaturan' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);

// 6. Wrap main content
let mainContentStart = code.indexOf('{/* Header Section */}');
let mainContentEnd = code.indexOf('{/* BottomNavBar (Mobile Only) */}');
let mainContentStr = code.substring(mainContentStart, mainContentEnd);
// The main content ends with `</div>\n      </main>\n\n      `
// Let's strip those off so we can wrap properly
mainContentStr = mainContentStr.replace(/\s*<\/div>\n\s*<\/main>\n\s*$/, "");

let newMainContent = `
        {activeTab === 'dashboard' && (
          <>
${mainContentStr}
          </>
        )}

        {activeTab === 'pengaturan' && (
          <div className="max-w-2xl mx-auto pt-6">
            <h2 className="font-heading text-3xl font-bold text-deep-obsidian mb-6">Pengaturan Profil</h2>
            <div className="bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              ${profileFormInner}
            </div>
          </div>
        )}
        </div>
      </main>

      `;

code = code.substring(0, mainContentStart) + newMainContent + code.substring(mainContentEnd);

fs.writeFileSync('src/app/teacher/page.tsx', code);
console.log("Teacher page refactored");
