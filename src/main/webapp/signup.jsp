<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 新規ユーザー登録</title>
    <%-- 元のCSSを読み込み --%>
    <link rel="stylesheet" href="css/trip.css">
    <style>
        :root {
            --tripplan-gold: #c08a10;
            --tripplan-bg-dark: #0a4d52; 
            --tripplan-bg-light: #166d74;
            --tripplan-input-bg: #f8fafc;
        }

        body {
            background: radial-gradient(circle at center, var(--tripplan-bg-light) 0%, var(--tripplan-bg-dark) 100%) !important;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
            overflow: hidden;
        }

        .signup-container {
            width: 360px;
            padding: 40px;
            background: white;
            border-radius: 24px;
            border-top: 8px solid var(--tripplan-gold);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            text-align: center;
        }

        .logo {
            width: 180px; /* 入力項目が多いので少し控えめサイズ */
            height: auto;
            margin: -20px auto 10px;
            display: block;
            filter: brightness(1.15) contrast(1.2);
            mix-blend-mode: multiply;
        }

        .signup-header h2 {
            color: var(--tripplan-gold);
            margin: 0;
            font-size: 1.4rem;
        }

        .signup-header p {
            color: #888;
            font-size: 0.85em;
            margin-top: 5px;
            margin-bottom: 20px;
        }

        .form-item {
            text-align: left;
            margin-bottom: 15px;
        }

        label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #555;
            font-size: 0.85em;
            padding-left: 5px;
        }

        .full-input {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background-color: var(--tripplan-input-bg);
            font-size: 0.95rem;
            outline: none;
            transition: all 0.2s;
        }

        .full-input:focus {
            border-color: var(--tripplan-gold);
            background-color: white;
            box-shadow: 0 0 0 3px rgba(192, 138, 16, 0.1);
        }

        .btn-submit {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #d4af37, #c08a10);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 10px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
            transition: all 0.3s;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .footer-link {
            text-align: center;
            margin-top: 25px;
            font-size: 0.85em;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
        }

        .footer-link a {
            color: var(--tripplan-gold);
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="signup-container">
    <div class="signup-header">
        <img src="img/Gemini_Generated_Image_ifam6eifam6eifam.png" alt="TripPlan Logo" class="logo">
        <h2>🐾 新規アカウント作成</h2>
        <p>新しい旅をここから始めましょう。</p>
    </div>

    <%-- アクションパスとname属性は元の「動くコード」を継承 --%>
    <form action="${pageContext.request.contextPath}/UserRegisterServlet" method="post">
        <div class="form-item">
            <label>ユーザーID</label>
            <input type="text" name="userId" class="full-input" placeholder="半角英数字" required autofocus>
        </div>

        <div class="form-item">
            <label>パスワード</label>
            <input type="password" name="pass" class="full-input" placeholder="パスワードを入力" required>
        </div>

        <div class="form-item">
            <label>パスワード（確認用）</label>
            <input type="password" name="passConfirm" class="full-input" placeholder="もう一度入力" required>
        </div>

        <button type="submit" class="btn-submit">アカウントを作成する 🐾</button>
    </form>

    <div class="footer-link">
        <a href="login.jsp">← ログイン画面に戻る</a>
    </div>
</div>

</body>
</html>