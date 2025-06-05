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
    name: '',
    furigana: '',
    birth_date: '',
    graduation_year: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

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

  // フォーム入力・送信ロジックは以前と同じ
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // ローカル開発用ダミーの場合は userId='LOCAL_TEST_USER' などを使って
    // バックエンドへ送信する。バックエンド側で「LOCAL_TEST_USER は検証しない」などの処理を入れておくとスムーズです。
    if (!profile) {
      setStatusMessage('プロフィールを取得中です……');
      return;
    }
    const payload = {
      line_user_id: userId,
      email: form.email,
      name: form.name,
      furigana: form.furigana,
      birth_date: form.birth_date,
      graduation_year: parseInt(form.graduation_year, 10)
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
      });
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>ユーザー登録フォーム</h2>
      {profile && <p>ようこそ、{profile.displayName} さん！</p>}
      <form onSubmit={handleSubmit}>
        {/* メールアドレス～卒業年度入力欄は同じ */}
        <div>
          <label>メールアドレス：<br />
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>氏名：<br />
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>ふりがな：<br />
            <input type="text" name="furigana" value={form.furigana} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>生年月日：<br />
            <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>卒業年度：<br />
            <input type="number" name="graduation_year" value={form.graduation_year} onChange={handleChange} />
          </label>
        </div>
        <button type="submit" style={{ marginTop: 16 }}>登録</button>
      </form>
      {statusMessage && <p style={{ marginTop: 16 }}>{statusMessage}</p>}
    </div>
  );
}

export default App;
