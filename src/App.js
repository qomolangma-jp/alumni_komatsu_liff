// src/App.js の例（一部だけ抜粋して示します）

import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import axios from 'axios';
import liffConfig from './liff-config';

function App() {
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    email: '',
    last_name: '',
    first_name: '',
    last_furigana: '',
    first_furigana: '',
    old_name: '',
    birth_date: '',
    graduation_year: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ① LIFF SDK 初期化
    liff.init({ liffId: liffConfig.liffId })
      .then(() => {
        // ② ローカルか LINE Client 内かをチェック
        if (!liff.isInClient()) {
          // ローカル開発時：ダミーのユーザー情報を設定しておく
          // ※実際の ID ではなく、テスト用の固定値や、環境変数から取得する方法もあります
          setUserId('LOCAL_TEST_USER');
          setProfile({ displayName: 'ローカル開発テスター' });
          setStatusMessage('ローカルモード：LIFF ログインをスキップしています');
          return;
        }

        // ③ LINE クライアント内で動作している場合：
        //    ログイン済みかチェックして、未ログインならログインさせる
        if (!liff.isLoggedIn()) {
          liff.login(); // ここが実機テスト中のみ走る。ローカルなら isInClient() で return 済み
        } else {
          liff.getProfile().then(profileData => {
            setProfile(profileData);
            setUserId(profileData.userId);
          });
        }
      })
      .catch(err => {
        console.error('LIFF initialization failed', err);
        setStatusMessage('LIFF の初期化に失敗しました。');
      });
  }, []);

  // 年・月・日セレクトボックス用の配列生成
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 - 14 + 1 }, (_, i) => currentYear - 14 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 卒業年度セレクトボックス用の配列生成
  const gradYears = Array.from({ length: 91 }, (_, i) => currentYear - i);

  // 年月日セレクトボックスの値をform.birth_dateに反映
  const [birth, setBirth] = useState({ year: '', month: '', day: '' });

  useEffect(() => {
    if (birth.year && birth.month && birth.day) {
      const mm = String(birth.month).padStart(2, '0');
      const dd = String(birth.day).padStart(2, '0');
      setForm(prev => ({ ...prev, birth_date: `${birth.year}-${mm}-${dd}` }));
    }
  }, [birth]);

  // フォーム入力・送信ロジックは以前と同じ
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!profile) {
      setStatusMessage('プロフィールを取得中です……');
      return;
    }
    setIsSubmitting(true);
    const payload = {
      line_user_id: userId,
      email: form.email,
      last_name: form.last_name,
      first_name: form.first_name,
      last_furigana: form.last_furigana,
      first_furigana: form.first_furigana,
      birth_date: form.birth_date,
      graduation_year: parseInt(form.graduation_year, 10),
      old_name: form.old_name || ''
    };
    axios.post(`${liffConfig.apiBaseUrl}/register`, payload)
      .then(res => {
        if (res.data.status === 'success') {
          setStatusMessage('登録が完了しました！');
        } else {
          setStatusMessage('登録に失敗しました。');
        }
      })
      .catch(err => {
        console.error('Registration error:', err.response || err);
        setStatusMessage('エラーが発生しました: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32, maxWidth: 400, width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: 24 }}>ユーザー登録フォーム</h2>
        {profile && <p style={{ textAlign: 'center', color: '#475569', marginBottom: 24 }}>ようこそ、{profile.displayName} さん！</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              メールアドレス <span style={{ color: 'red', fontWeight: 700 }}>※</span><br />
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 18, display: 'flex', gap: 8 }}>
            <label style={{ flex: 1, color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              姓 <span style={{ color: 'red', fontWeight: 700 }}>※</span><br />
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
              />
            </label>
            <label style={{ flex: 1, color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              名 <span style={{ color: 'red', fontWeight: 700 }}>※</span><br />
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 18, display: 'flex', gap: 8 }}>
            <label style={{ flex: 1, color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              セイ <span style={{ color: 'red', fontWeight: 700 }}>※</span><br />
              <input type="text" name="last_furigana" value={form.last_furigana} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
              />
            </label>
            <label style={{ flex: 1, color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              メイ <span style={{ color: 'red', fontWeight: 700 }}>※</span><br />
              <input type="text" name="first_furigana" value={form.first_furigana} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: '#334155', fontWeight: 500, marginBottom: 6 }}>生年月日：<br />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <select name="birth_year" value={birth.year} onChange={e => setBirth(b => ({ ...b, year: e.target.value }))} required
                  style={{ flex: 1, padding: '10px 6px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16 }}>
                  <option value="">年</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select name="birth_month" value={birth.month} onChange={e => setBirth(b => ({ ...b, month: e.target.value }))} required
                  style={{ flex: 1, padding: '10px 6px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16 }}>
                  <option value="">月</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="birth_day" value={birth.day} onChange={e => setBirth(b => ({ ...b, day: e.target.value }))} required
                  style={{ flex: 1, padding: '10px 6px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16 }}>
                  <option value="">日</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#334155', fontWeight: 500, marginBottom: 6 }}>卒業年度：<br />
              <select name="graduation_year" value={form.graduation_year} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}>
                <option value="">選択してください</option>
                {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: '#334155', fontWeight: 500, marginBottom: 6 }}>
              旧姓（任意）<br />
              <input type="text" name="old_name" value={form.old_name} onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', marginTop: 4 }}
                placeholder="卒業時と苗字が変更された方は旧姓をご入力ください"
              />
              <span style={{ fontSize: 12, color: '#64748b' }}>卒業時と苗字が変更された方は旧姓をご入力ください</span>
            </label>
          </div>
          {!isSubmitting ? (
            <button type="submit" style={{ width: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 0', marginTop: 8, boxShadow: '0 2px 8px rgba(56,189,248,0.10)', cursor: 'pointer', transition: 'background 0.2s' }}>
              登録
            </button>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
              <span style={{ display: 'inline-block', color: '#2563eb', fontWeight: 600, fontSize: 16 }}>
                登録中...
              </span>
            </div>
          )}
        </form>
        {statusMessage && <p style={{ marginTop: 24, textAlign: 'center', color: '#0f766e', fontWeight: 500 }}>{statusMessage}</p>}
      </div>
    </div>
  );
}

export default App;
