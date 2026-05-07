<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 ログイン</title>
    <link rel="stylesheet" href="css/trip.css">
    <style>
        .login-container {
            width: 350px;
            margin: 100px auto;
            padding: 30px;
            background: white;
            border-radius: 15px;
            border-top: 6px solid var(--dog-gold);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
        }
        .login-input {
            width: 100%;
            margin-bottom: 15px;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-sizing: border-box;
        }
        .login-btn {
            width: 100%;
            padding: 12px;
            background: var(--dog-gold);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        }
        .login-btn:hover { background: #b8860b; }
        .error-msg { color: var(--emergency-red); font-size: 0.85em; margin-bottom: 10px; }
        
        /* 新規登録リンク用のスタイル */
        .signup-link {
            margin-top: 20px;
            font-size: 0.85em;
            border-top: 1px solid #eee;
            padding-top: 15px;
            color: #666;
        }
        .signup-link a {
            color: var(--dog-gold);
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body style="background-color: #f4f7f9; overflow: auto;">

<div class="login-container">
    <h2 style="color: var(--dog-gold);">🐾 TripPlan</h2>
    <p style="font-size: 0.9em; color: #666; margin-bottom: 20px;">旅の計画を始めましょう</p>

    <%-- エラーメッセージの表示エリア --%>
    <% String error = (String) request.getAttribute("error"); %>
    <% if (error != null) { %>
        <div class="error-msg"><%= error %></div>
    <% } %>

    <form action="LoginServlet" method="post">
        <input type="text" name="user" class="login-input" placeholder="ユーザーID" required>
        <input type="password" name="pass" class="login-input" placeholder="パスワード" required>
        <button type="submit" class="login-btn">ログイン</button>
    </form>

    <%-- 新規登録リンクをコンテナの中に配置 --%>
    <div class="signup-link">
        アカウントをお持ちでないですか？<br>
        <a href="signup.jsp">🐾 新規ユーザー登録</a>
    </div>
</div>

</body>
</html>