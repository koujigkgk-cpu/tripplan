<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 ログイン</title>
    <%-- 元のCSSファイルも読み込みつつ、追加のデザインを適用 --%>
    <link rel="stylesheet" href="css/trip.css">
    <style>
        :root {
            /* 既存の変数を上書き、または追加 */
            --tripplan-gold: #c08a10;
            --tripplan-bg-dark: #0a4d52; 
            --tripplan-bg-light: #166d74;
            --tripplan-input-bg: #f8fafc;
        }

        body {
            /* 背景をダークティールのグラデーションに */
            background: radial-gradient(circle at center, var(--tripplan-bg-light) 0%, var(--tripplan-bg-dark) 100%) !important;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
            overflow: hidden;
        }

        .login-container {
            width: 360px;
            padding: 40px;
            background: white;
            border-radius: 24px;
            border-top: 8px solid var(--tripplan-gold);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            text-align: center;
            margin: 0 auto; /* 中央配置 */
        }

        .logo {
            width: 250px;
            height: auto;
            margin: -20px auto 10px;
            display: block;
            /* ロゴを背景に馴染ませる魔法のフィルタ */
            filter: brightness(1.15) contrast(1.2);
            mix-blend-mode: multiply;
        }

        .tagline {
            font-size: 0.85rem;
            color: #555;
            margin-bottom: 25px;
            line-height: 1.6;
            font-weight: 500;
        }

        .error-msg {
            background-color: #fff5f5;
            color: #e53e3e;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.85em;
            margin-bottom: 20px;
        }

        .login-input {
            width: 100%;
            margin-bottom: 15px;
            padding: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background-color: var(--tripplan-input-bg);
            box-sizing: border-box;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s;
        }

        .login-input:focus {
            border-color: var(--tripplan-gold);
            background-color: white;
            box-shadow: 0 0 0 3px rgba(192, 138, 16, 0.1);
        }

        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #c98e12, #a0720d); 
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(201, 142, 18, 0.2);
            transition: all 0.3s;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(201, 142, 18, 0.3);
        }

        .signup-link {
            margin-top: 30px;
            font-size: 0.85em;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
            color: #718096;
        }

        .signup-link a {
            color: var(--tripplan-gold);
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="login-container">
    <img src="img/Gemini_Generated_Image_ifam6eifam6eifam.png" alt="TripPlan Logo" class="logo">

    <div class="tagline">
        旅の計画を始めましょう。 🐾<br>
        理想のルートを、ここから猫こう。
    </div>

    <%-- エラーメッセージ表示（動くロジックを維持） --%>
    <% String error = (String) request.getAttribute("error"); %>
    <% if (error != null) { %>
        <div class="error-msg"><%= error %></div>
    <% } %>

    <form action="LoginServlet" method="post">
        <%-- name="user" と name="pass" は元の動く設定のまま --%>
        <input type="text" name="user" class="login-input" placeholder="ユーザーID" required autofocus>
        <input type="password" name="pass" class="login-input" placeholder="パスワード" required>
        <button type="submit" class="login-btn">ログイン</button>
    </form>

    <div class="signup-link">
        アカウントをお持ちでないですか？<br>
        <a href="signup.jsp">🐾 新規ユーザー登録</a>
    </div>
</div>

</body>
</html>