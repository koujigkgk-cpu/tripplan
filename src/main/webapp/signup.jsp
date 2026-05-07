<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 新規ユーザー登録</title>
    <link rel="stylesheet" href="css/trip.css">
    <style>
        .signup-container {
            width: 380px;
            margin: 80px auto;
            padding: 35px;
            background: white;
            border-radius: 20px;
            border-top: 8px solid var(--route-blue); /* 登録は青系で爽やかに */
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .signup-header { text-align: center; margin-bottom: 25px; }
        .signup-header h2 { color: var(--route-blue); margin: 0; }
        
        .form-item { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; font-size: 0.9em; }
        .full-input { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
        
        .btn-submit { width: 100%; background: var(--route-blue); color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .btn-submit:hover { opacity: 0.9; }
        
        .footer-link { text-align: center; margin-top: 20px; font-size: 0.85em; }
        .footer-link a { color: var(--route-blue); text-decoration: none; }
    </style>
</head>
<body style="background-color: #f4f7f9;">

<div class="signup-container">
    <div class="signup-header">
        <h2>🐾 新規アカウント作成</h2>
        <p style="color: #888; font-size: 0.85em; margin-top: 5px;">TripPlanへようこそ！</p>
    </div>

    <form action="${pageContext.request.contextPath}/UserRegisterServlet" method="post">
        <div class="form-item">
            <label>ユーザーID</label>
            <input type="text" name="userId" class="full-input" placeholder="半角英数字" required>
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