import React, { useState, useEffect } from 'react';
2: import { Link, useNavigate } from 'react-router-dom';
3: import { Input } from '../components/Input';
4: import { Button } from '../components/Button';
5: import { UploadCloud, CheckCircle2 } from 'lucide-react';
6: import { authService } from '../services/authService';
7: 
8: export const Register = () => {
9:     const navigate = useNavigate();
10:     const [name, setName] = useState('');
11:     const [email, setEmail] = useState('');
12:     const [password, setPassword] = useState('');
13:     const [confirmPassword, setConfirmPassword] = useState('');
14:     const [role, setRole] = useState('student');
15:     const [major, setMajor] = useState('');
16:     const [specializations, setSpecializations] = useState([]);
17:     const [error, setError] = useState('');
18:     const [success, setSuccess] = useState('');
19:     const [loading, setLoading] = useState(false);
20:     const [allSkills, setAllSkills] = useState([]);
21:     const [selectedSkills, setSelectedSkills] = useState([]);
22:     const [isExtracting, setIsExtracting] = useState(false);
23: 
24:     useEffect(() => {
25:         const fetchSkills = async () => {
26:             try {
27:                 const res = await fetch('http://127.0.0.1:8000/api/skills');
28:                 if (res.ok) {
29:                     const data = await res.json();
30:                     setAllSkills(data);
31:                 }
32:             } catch (err) {
33:                 console.error("Failed to load skills", err);
34:             }
35:         };
36: 
37:         const fetchSpecializations = async () => {
38:             try {
39:                 const res = await fetch('http://127.0.0.1:8000/api/specializations');
40:                 if (res.ok) {
41:                     const data = await res.json();
42:                     setSpecializations(data);
43:                 }
44:             } catch (err) {
45:                 console.error("Failed to load specializations", err);
46:             }
47:         };
48: 
49:         fetchSpecializations();
50:         fetchSkills();
51:     }, []);
52: 
53:     const handleCVUpload = async (e) => {
54:         const file = e.target.files[0];
55:         if (!file) return;
56: 
57:         setIsExtracting(true);
58:         setError('');
59: 
60:         const formData = new FormData();
61:         formData.append('file', file);
62: 
63:         try {
64:             const response = await fetch('http://127.0.0.1:8000/api/user/extract-skills', {
65:                 method: 'POST',
66:                 body: formData
67:             });
68: 
69:             if (!response.ok) throw new Error("Failed to extract skills from CV");
70: 
71:             const data = await response.json();
72:             if (data.skills && data.skills.length > 0) {
73:                 setSelectedSkills(prev => {
74:                     const currentNames = new Set(prev.map(s => typeof s === 'string' ? s : s.name));
75:                     const newOnes = data.skills.filter(s => !currentNames.has(s.name));
76:                     return [...prev, ...newOnes];
77:                 });
78:             } else {
79:                 setError("No skills matched from your CV. You can still add them manually below.");
80:             }
81:         } catch (err) {
82:             setError(err.message);
83:         } finally {
84:             setIsExtracting(false);
85:             e.target.value = null;
86:         }
87:     };
88: 
89:     const toggleSkill = (skill) => {
90:         const skillName = typeof skill === 'string' ? skill : skill.skill_name;
91:         setSelectedSkills(prev => {
92:             const exists = prev.some(s => (typeof s === 'string' ? s : s.name) === skillName);
93:             if (exists) {
94:                 return prev.filter(s => (typeof s === 'string' ? s : s.name) !== skillName);
95:             } else {
96:                 return [...prev, { name: skillName, level: 'Beginner', progress: 30, status: 'Not tested' }];
97:             }
98:         });
99:     };
100: 
101:     const handleSubmit = async (e) => {
102:         e.preventDefault();
103:         setError('');
104:         setSuccess('');
105: 
106:         if (!name || !email || !password || !confirmPassword) {
107:             setError('Please fill in all fields.');
108:             return;
109:         }
110: 
111:         if (password !== confirmPassword) {
112:             setError('Passwords do not match.');
113:             return;
114:         }
115: 
116:         setLoading(true);
117:         try {
118:             await authService.register(name, email, password, role, major, selectedSkills);
119:             setSuccess('Registration successful! Redirecting to login...');
120:             setTimeout(() => {
121:                 navigate('/login');
122:             }, 2000);
123:         } catch (err) {
124:             setError(err.message || 'Registration failed. Please try again.');
125:         } finally {
126:             setLoading(false);
127:         }
128:     };
129: 
130:     return (
131:         <>
132:             <form onSubmit={handleSubmit} style={{ width: '100%' }}>
133:                 {error && (
134:                     <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
135:                         {error}
136:                     </div>
137:                 )}
138:                 {success && (
139:                     <div style={{ padding: '0.75rem', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
140:                         {success}
141:                     </div>
142:                 )}
143: 
144:                 <Input
145:                     label="Full name"
146:                     type="text"
147:                     placeholder="John Doe"
148:                     required
149:                     value={name}
150:                     onChange={(e) => setName(e.target.value)}
151:                     disabled={loading}
152:                 />
153: 
154:                 <Input
155:                     label="Email address"
156:                     type="email"
157:                     placeholder="your@email.com"
158:                     required
159:                     value={email}
160:                     onChange={(e) => setEmail(e.target.value)}
161:                     disabled={loading}
162:                 />
163: 
164:                 <div style={{ marginBottom: '1.25rem' }}>
165:                     <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
166:                         Major / Field of Study
167:                     </label>
168:                     <select
169:                         value={major}
170:                         onChange={(e) => setMajor(e.target.value)}
171:                         disabled={loading || specializations.length === 0}
172:                         required
173:                         style={{
174:                             width: '100%',
175:                             padding: '0.75rem 1rem',
176:                             borderRadius: 'var(--radius-md)',
177:                             border: '1px solid var(--color-border)',
178:                             backgroundColor: 'white',
179:                             fontSize: '1rem',
180:                             outline: 'none',
181:                             fontFamily: 'inherit',
182:                             transition: 'border-color 0.2s',
183:                             boxSizing: 'border-box'
184:                         }}
185:                     >
186:                         <option value="" disabled>Select your specialization</option>
187:                         {specializations.map(spec => (
188:                             <option key={spec} value={spec}>{spec}</option>
189:                         ))}
190:                     </select>
191:                 </div>
192: 
193:                 {/* CV Scan and Skill selection block */}
194:                 <div style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-light)' }}>
195:                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
196:                         <div>
197:                             <h5 style={{ fontWeight: '600', fontSize: '0.925rem', marginBottom: '0.25rem' }}>Initial Skills (Optional)</h5>
198:                             <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Scan your CV or select manually below</p>
199:                         </div>
200:                         
201:                         <div style={{ position: 'relative' }}>
202:                             <input 
203:                                 type="file" 
204:                                 id="cv-upload-reg" 
205:                                 accept=".pdf,.docx,.txt" 
206:                                 style={{ display: 'none' }} 
207:                                 onChange={handleCVUpload}
208:                                 disabled={isExtracting || loading}
209:                             />
210:                             <label 
211:                                 htmlFor="cv-upload-reg" 
212:                                 style={{ 
213:                                     display: 'flex', 
214:                                     alignItems: 'center', 
215:                                     gap: '0.5rem', 
216:                                     padding: '0.4rem 0.8rem', 
217:                                     background: 'var(--color-primary-light)', 
218:                                     color: 'var(--color-primary)', 
219:                                     borderRadius: 'var(--radius-md)', 
220:                                     cursor: (isExtracting || loading) ? 'not-allowed' : 'pointer',
221:                                     fontWeight: '600',
222:                                     fontSize: '0.8rem',
223:                                     transition: 'all 0.2s',
224:                                     opacity: (isExtracting || loading) ? 0.7 : 1
225:                                 }}
226:                             >
227:                                 <UploadCloud size={16} />
228:                                 {isExtracting ? 'Scanning...' : 'Scan CV'}
229:                             </label>
230:                         </div>
231:                     </div>
232: 
233:                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
234:                         {allSkills.length > 0 ? allSkills.map(skill => {
235:                             const isSelected = selectedSkills.some(s => (typeof s === 'string' ? s : s.name) === skill.skill_name);
236:                             return (
237:                                 <button
238:                                     key={skill.skill_name}
239:                                     type="button"
240:                                     onClick={() => toggleSkill(skill)}
241:                                     style={{
242:                                         padding: '0.25rem 0.75rem',
243:                                         borderRadius: 'var(--radius-full)',
244:                                         fontSize: '0.75rem',
245:                                         fontWeight: '600',
246:                                         cursor: 'pointer',
247:                                         border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
248:                                         background: isSelected ? 'var(--color-primary)' : 'transparent',
249:                                         color: isSelected ? 'white' : 'var(--color-text)',
250:                                         transition: 'all 0.2s',
251:                                         display: 'flex',
252:                                         alignItems: 'center',
253:                                         gap: '0.25rem'
254:                                     }}
255:                                 >
256:                                     {skill.skill_name}
257:                                     {isSelected && <CheckCircle2 size={10} />}
258:                                 </button>
259:                             );
260:                         }) : (
261:                             <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', width: '100%', padding: '1rem' }}>
262:                                 Loading available skills...
263:                             </p>
264:                         )}
265:                     </div>
266:                 </div>
267: 
268:                 <Input
269:                     label="Password"
270:                     type="password"
271:                     placeholder="••••••••"
272:                     required
273:                     value={password}
274:                     onChange={(e) => setPassword(e.target.value)}
275:                     disabled={loading}
276:                 />
277: 
278:                 <Input
279:                     label="Confirm password"
280:                     type="password"
281:                     placeholder="••••••••"
282:                     required
283:                     value={confirmPassword}
284:                     onChange={(e) => setConfirmPassword(e.target.value)}
285:                     disabled={loading}
286:                 />
287: 
288:                 <div style={{ marginBottom: '1.25rem' }}>
289:                     <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
290:                         I am a...
291:                     </label>
292:                     <div style={{ display: 'flex', gap: '1rem' }}>
293:                         {['student', 'graduate'].map((r) => (
294:                             <label
295:                                 key={r}
296:                                 style={{
297:                                     flex: '1',
298:                                     border: `2px solid ${role === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
299:                                     backgroundColor: role === r ? 'var(--color-active)' : 'transparent',
300:                                     padding: '1rem',
301:                                     borderRadius: 'var(--radius-md)',
302:                                     cursor: 'pointer',
303:                                     textAlign: 'center',
304:                                     fontWeight: '600',
305:                                     color: role === r ? 'var(--color-primary)' : 'var(--color-text)',
306:                                     transition: 'var(--transition)',
307:                                     opacity: loading ? 0.6 : 1,
308:                                     pointerEvents: loading ? 'none' : 'auto'
309:                                 }}
310:                             >
311:                                 <input
312:                                     type="radio"
313:                                     name="role"
314:                                     value={r}
315:                                     checked={role === r}
316:                                     onChange={(e) => setRole(e.target.value)}
317:                                     style={{ display: 'none' }}
318:                                     disabled={loading}
319:                                 />
320:                                 {r.charAt(0).toUpperCase() + r.slice(1)}
321:                             </label>
322:                         ))}
323:                     </div>
324:                 </div>
325: 
326:                 <Button type="submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
327:                     {loading ? 'Creating account...' : 'Create account'}
328:                 </Button>
329:             </form>
330: 
331:             <div style={{
332:                 marginTop: '2rem',
333:                 textAlign: 'center',
334:                 fontSize: '0.875rem',
335:                 color: 'var(--color-text-muted)',
336:                 borderTop: '1px solid var(--color-border)',
337:                 paddingTop: '1.5rem'
338:             }}>
339:                 Already have an account?{' '}
340:                 <Link to="/login" style={{ fontWeight: '600' }}>
341:                     Log in
342:                 </Link>
343:             </div>
344:         </>
345:     );
346: };
