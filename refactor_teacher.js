const fs = require('fs');
let code = fs.readFileSync('src/app/teacher/page.tsx', 'utf-8');

// 1. Replace state
code = code.replace(
  /const \[isEditProfileOpen, setIsEditProfileOpen\] = useState\(false\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'pengaturan'>('dashboard');\n  // Profile Edit"
);

// 2. Remove modals
let profileEditModalStart = code.indexOf('{/* Profile Edit Modal */}');
let profileEditModalEnd = code.indexOf('{/* Mobile Sidebar Overlay */}');
let profileFormStr = code.substring(profileEditModalStart, profileEditModalEnd);

code = code.substring(0, profileEditModalStart) + code.substring(profileEditModalEnd);

// Extract form for Profile
let profileFormInner = profileFormStr.match(/<form[\s\S]*?<\/form>/)[0];
// Update button inside profile form
profileFormInner = profileFormInner.replace(
  /onClick=\{\(\) => setIsEditProfileOpen\(false\)\}/,
  "onClick={() => setActiveTab('dashboard')}"
);

// Update successful callback inside handleUpdateProfile
code = code.replace(
  /setIsEditProfileOpen\(false\);/,
  "setActiveTab('dashboard');"
);

// 3. Sidebar links
code = code.replace(
  /<Link href="\/teacher" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white\/10 transition-colors duration-200 cursor-pointer">/,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'dashboard' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);
code = code.replace(/<\/Link>\n\s*<\/li>\n\s*<li>\n\s*<button onClick=\{handleCreateSession\}/g, `</button>\n          </li>\n          <li>\n            <button onClick={handleCreateSession}`);
code = code.replace(/onClick=\{\(\) => setIsEditProfileOpen\(true\)\}/g, `onClick={() => setActiveTab('pengaturan')}`);

// 4. Update the other link classes
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('pengaturan'\)\} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant\/70 font-heading font-bold text-sm hover:bg-white\/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'pengaturan' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);

// 5. Update mobile bottom bar
code = code.replace(
  /<Link href="\/teacher" className="flex flex-col items-center gap-1 text-electric-blue">/,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex flex-col items-center gap-1 \${activeTab === 'dashboard' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);
code = code.replace(
  /<\/Link>\n\s*<button onClick=\{handleCreateSession\}/g,
  `</button>\n        <button onClick={handleCreateSession}`
);
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('pengaturan'\)\} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex flex-col items-center gap-1 \${activeTab === 'pengaturan' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);

// 6. Wrap dashboard main content
let mainContentStart = code.indexOf('{/* Header Section */}');
let mainContentEnd = code.indexOf('{/* BottomNavBar (Mobile Only) */}');
let mainContentStr = code.substring(mainContentStart, mainContentEnd);

let newMainContent = `
        {activeTab === 'dashboard' && (
          <>
${mainContentStr}
          </>
        )}

        {activeTab === 'pengaturan' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-deep-obsidian mb-6">Pengaturan Profil</h2>
            <div className="bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              ${profileFormInner}
            </div>
          </div>
        )}
`;

code = code.substring(0, mainContentStart) + newMainContent + "\n      " + code.substring(mainContentEnd);

fs.writeFileSync('src/app/teacher/page.tsx', code);
console.log("Refactored teacher/page.tsx");
