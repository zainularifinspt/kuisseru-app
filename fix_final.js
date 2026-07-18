const fs = require('fs');

// Fix admin
let admin = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
admin = admin.replace(/      <\/main>\n\n        <\/div>\n        <\/div>\n      <\/main>/, "        </div>\n      </main>");
// Fix bottom nav
admin = admin.replace(
  /<\/Link>\n\s*<button onClick=\{\(\) => setIsCreateTeacherOpen\(true\)\}/g,
  "</button>\n        <button onClick={() => setActiveTab('tambah-guru')}"
);
admin = admin.replace(
  /<\/Link>\n\s*<button onClick=\{\(\) => setActiveTab\('tambah-guru'\)\}/g,
  "</button>\n        <button onClick={() => setActiveTab('tambah-guru')}"
);
admin = admin.replace(
  /onClick=\{\(\) => setIsEditProfileOpen\(true\)\}/g,
  "onClick={() => setActiveTab('pengaturan')}"
);
fs.writeFileSync('src/app/admin/page.tsx', admin);

// Fix teacher
let teacher = fs.readFileSync('src/app/teacher/page.tsx', 'utf-8');
teacher = teacher.replace(/      <\/main>\n\n        <\/div>\n        <\/div>\n      <\/main>/, "        </div>\n      </main>");
// Fix bottom nav
teacher = teacher.replace(
  /<\/Link>\n\s*<button onClick=\{handleCreateSession\}/g,
  "</button>\n        <button onClick={handleCreateSession}"
);
fs.writeFileSync('src/app/teacher/page.tsx', teacher);
console.log("Fixed files");
