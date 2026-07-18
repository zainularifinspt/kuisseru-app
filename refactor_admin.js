const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// 1. Replace state
code = code.replace(
  /const \[isEditProfileOpen, setIsEditProfileOpen\] = useState\(false\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'tambah-guru' | 'pengaturan'>('dashboard');\n  // Profile Edit"
);
code = code.replace(/const \[isCreateTeacherOpen, setIsCreateTeacherOpen\] = useState\(false\);\n/, "");

// 2. Remove modals
// Find the AnimatePresence for Profile Edit Modal
let profileEditModalStart = code.indexOf('{/* Profile Edit Modal */}');
let profileEditModalEnd = code.indexOf('{/* Create Teacher Modal */}');
let profileFormStr = code.substring(profileEditModalStart, profileEditModalEnd);

// Find the AnimatePresence for Create Teacher Modal
let createTeacherModalStart = profileEditModalEnd;
let createTeacherModalEnd = code.indexOf('{/* Mobile Sidebar Overlay */}');
let createTeacherFormStr = code.substring(createTeacherModalStart, createTeacherModalEnd);

code = code.substring(0, profileEditModalStart) + code.substring(createTeacherModalEnd);

// Extract form for Profile
let profileFormInner = profileFormStr.match(/<form[\s\S]*?<\/form>/)[0];
// Update button inside profile form
profileFormInner = profileFormInner.replace(
  /onClick=\{\(\) => setIsEditProfileOpen\(false\)\}/,
  "onClick={() => setActiveTab('dashboard')}"
);

// Extract form for Teacher
let teacherFormInner = createTeacherFormStr.match(/<form[\s\S]*?<\/form>/)[0];
// Update button inside teacher form
teacherFormInner = teacherFormInner.replace(
  /onClick=\{\(\) => setIsCreateTeacherOpen\(false\)\}/,
  "onClick={() => setActiveTab('dashboard')}"
);

// Update successful callback inside handleCreateTeacher
code = code.replace(
  /setIsCreateTeacherOpen\(false\);/,
  "setActiveTab('dashboard');"
);
// Update successful callback inside handleUpdateProfile
code = code.replace(
  /setIsEditProfileOpen\(false\);/,
  "setActiveTab('dashboard');"
);

// 3. Sidebar links
code = code.replace(
  /<Link href="\/admin" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white\/10 transition-colors duration-200 cursor-pointer">/,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'dashboard' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);
code = code.replace(/<\/Link>\n\s*<\/li>\n\s*<li>\n\s*<button onClick=\{\(\) => setIsCreateTeacherOpen\(true\)\}/g, `</button>\n          </li>\n          <li>\n            <button onClick={() => setActiveTab('tambah-guru')}`);
code = code.replace(/onClick=\{\(\) => setIsEditProfileOpen\(true\)\}/g, `onClick={() => setActiveTab('pengaturan')}`);

// 4. Update the other link classes
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('tambah-guru'\)\} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant\/70 font-heading font-bold text-sm hover:bg-white\/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">/g,
  `<button onClick={() => setActiveTab('tambah-guru')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'tambah-guru' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('pengaturan'\)\} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant\/70 font-heading font-bold text-sm hover:bg-white\/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex items-center gap-4 px-4 py-3 rounded-lg font-heading font-bold text-sm transition-colors duration-200 cursor-pointer w-full text-left \${activeTab === 'pengaturan' ? 'text-cyber-lime border-l-4 border-cyber-lime bg-white/10' : 'text-surface-variant/70 hover:bg-white/5 hover:text-surface-variant'}\`}>`
);

// 5. Update mobile bottom bar
code = code.replace(
  /<Link href="\/admin" className="flex flex-col items-center gap-1 text-electric-blue">/,
  `<button onClick={() => setActiveTab('dashboard')} className={\`flex flex-col items-center gap-1 \${activeTab === 'dashboard' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);
code = code.replace(
  /<\/Link>\n\s*<button onClick=\{\(\) => setActiveTab\('tambah-guru'\)\} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">/g,
  `</button>\n        <button onClick={() => setActiveTab('tambah-guru')} className={\`flex flex-col items-center gap-1 \${activeTab === 'tambah-guru' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('pengaturan'\)\} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">/g,
  `<button onClick={() => setActiveTab('pengaturan')} className={\`flex flex-col items-center gap-1 \${activeTab === 'pengaturan' ? 'text-electric-blue' : 'text-on-surface-variant hover:text-electric-blue'}\`}>`
);

// 6. Wrap dashboard main content and remove "Tambah Guru" button
let mainContentStart = code.indexOf('{/* Header Section */}');
let mainContentEnd = code.indexOf('{/* BottomNavBar (Mobile Only) */}');
let mainContentStr = code.substring(mainContentStart, mainContentEnd);

// Remove button inside header section
mainContentStr = mainContentStr.replace(
  /<button \s*onClick=\{\(\) => setActiveTab\('tambah-guru'\)\}[\s\S]*?<\/button>/,
  ""
);

let newMainContent = `
        {activeTab === 'dashboard' && (
          <>
${mainContentStr}
          </>
        )}
        
        {activeTab === 'tambah-guru' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-deep-obsidian mb-6">Tambah Guru Baru</h2>
            <div className="bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              ${teacherFormInner}
            </div>
          </div>
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

fs.writeFileSync('src/app/admin/page.tsx', code);
console.log("Refactored admin/page.tsx");
