'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { User, Bell, Shield, Palette, Globe, ChevronRight, Check } from 'lucide-react';

const SECTIONS = [
  { id:'profile',       icon: User,    label: 'Profile',        desc: 'School name, contact details' },
  { id:'notifications', icon: Bell,    label: 'Notifications',  desc: 'Email and push preferences'   },
  { id:'security',      icon: Shield,  label: 'Security',       desc: 'Password and 2FA'              },
  { id:'appearance',    icon: Palette, label: 'Appearance',     desc: 'Theme and display settings'    },
  { id:'language',      icon: Globe,   label: 'Language',       desc: 'Language and region'           },
];

export default function SettingsPage() {
  const [active,   setActive]   = useState('profile');
  const [saved,    setSaved]    = useState(false);
  const [profile, setProfile]   = useState({
    schoolName:  'Delhi Public School',
    city:        'Bokaro Steel City',
    email:       'admin@dps-bokaro.edu.in',
    phone:       '+91 98765 43210',
    board:       'CBSE',
    established: '1987',
  });
  const [notifs, setNotifs] = useState({
    emailNewAssignment: true,
    emailGenComplete:   true,
    pushGenComplete:    false,
    weeklyReport:       true,
  });

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings"/>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-green-500"/>
          <h1 className="text-[15px] font-semibold text-gray-900">Settings</h1>
        </div>
        <p className="text-[12px] text-gray-500 mb-5">Manage your school account and preferences.</p>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar nav */}
          <div className="lg:w-52 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {SECTIONS.map(({ id, icon: Icon, label, desc }) => (
                <button key={id} onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${active === id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active === id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={14}/>
                  </div>
                  <div className="min-w-0 hidden xs:block">
                    <p className={`text-[12px] font-medium truncate ${active === id ? 'text-brand' : 'text-gray-900'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{desc}</p>
                  </div>
                  <ChevronRight size={12} className={`ml-auto shrink-0 hidden xs:block ${active === id ? 'text-brand' : 'text-gray-300'}`}/>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              {active === 'profile' && (
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-4">School Profile</h2>
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-brand text-xl font-bold">D</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{profile.schoolName}</p>
                      <p className="text-[12px] text-gray-500">{profile.city}</p>
                      <button className="text-[11px] text-brand hover:underline mt-1">Change logo</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label:'School Name',  key:'schoolName'  },
                      { label:'City',         key:'city'        },
                      { label:'Email',        key:'email'       },
                      { label:'Phone',        key:'phone'       },
                      { label:'Board',        key:'board'       },
                      { label:'Established',  key:'established' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
                        <input value={(profile as any)[key]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-gray-200 transition-all"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === 'notifications' && (
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key:'emailNewAssignment', label:'New Assignment Created',    desc:'Email when a new assignment is created' },
                      { key:'emailGenComplete',   label:'Generation Complete',       desc:'Email when AI finishes generating a paper' },
                      { key:'pushGenComplete',    label:'Push: Generation Complete', desc:'Browser notification when paper is ready' },
                      { key:'weeklyReport',       label:'Weekly Summary Report',     desc:'Weekly email with assignment statistics' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-[13px] font-medium text-gray-900">{label}</p>
                          <p className="text-[11px] text-gray-500">{desc}</p>
                        </div>
                        <button onClick={() => setNotifs(p => ({ ...p, [key]: !(p as any)[key] }))}
                          className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${(notifs as any)[key] ? 'bg-brand' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${(notifs as any)[key] ? 'translate-x-5' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === 'security' && (
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-gray-200"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-gray-200"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-gray-200"/>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                      <div>
                        <p className="text-[13px] font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-[11px] text-gray-500">Add an extra layer of security</p>
                      </div>
                      <button className="text-[12px] text-brand font-medium hover:underline">Enable</button>
                    </div>
                  </div>
                </div>
              )}

              {active === 'appearance' && (
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Appearance</h2>
                  <div className="space-y-5">
                    <div>
                      <p className="text-[12px] font-medium text-gray-700 mb-2">Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['Light','Dark','System'].map((t, i) => (
                          <button key={t} className={`border-2 rounded-xl p-3 text-center transition-all ${i===0 ? 'border-brand bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-lg mx-auto mb-2 ${i===0?'bg-white border border-gray-200':i===1?'bg-gray-900':'bg-gradient-to-br from-white to-gray-900'}`}/>
                            <p className={`text-[12px] font-medium ${i===0?'text-brand':'text-gray-700'}`}>{t}</p>
                            {i===0 && <Check size={12} className="text-brand mx-auto mt-1"/>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-700 mb-2">Accent Color</p>
                      <div className="flex gap-2">
                        {['#E8470A','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c, i) => (
                          <button key={c} className={`w-8 h-8 rounded-full border-2 transition-all ${i===0?'border-gray-900 scale-110':'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: c }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === 'language' && (
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Language & Region</h2>
                  <div className="space-y-4">
                    {[
                      { label:'Language',     options:['English (India)','Hindi','Bengali','Tamil','Telugu'] },
                      { label:'Date Format',  options:['DD-MM-YYYY','MM-DD-YYYY','YYYY-MM-DD'] },
                      { label:'Time Zone',    options:['Asia/Kolkata (IST)','UTC','Asia/Dubai'] },
                    ].map(({ label, options }) => (
                      <div key={label}>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
                        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-gray-200 bg-white">
                          {options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave}
                  className={`flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                  {saved ? (<><Check size={14}/> Saved!</>) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
