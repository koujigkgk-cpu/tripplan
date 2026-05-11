<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 旅行計画メニュー</title>
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

        .menu-container {
            width: 380px;
            padding: 45px 35px;
            background: white;
            border-radius: 28px;
            border-top: 8px solid var(--tripplan-gold);
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            text-align: center;
        }

        .logo-main {
            width: 220px;
            height: auto;
            margin: -20px auto 10px;
            display: block;
            filter: brightness(1.15) contrast(1.2);
            mix-blend-mode: multiply;
        }

        h2 {
            color: var(--tripplan-gold);
            margin-bottom: 30px;
            font-size: 1.6rem;
            letter-spacing: 1px;
            font-weight: bold;
        }

        .menu-grid {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .btn-menu {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 18px;
            background-color: var(--tripplan-input-bg);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            text-decoration: none;
            color: var(--tripplan-bg-dark);
            font-weight: bold;
            font-size: 1.05rem;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .btn-menu:hover {
            transform: translateY(-4px);
            background-color: white;
            border-color: var(--tripplan-gold);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            color: var(--tripplan-gold);
        }

        .btn-mission {
            background-color: #f0f9ff;
            border-color: #bae6fd;
            color: #0369a1;
        }

        .btn-mission:hover {
            border-color: #0369a1;
            color: #0369a1;
        }

        .footer-nav {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            font-size: 0.85rem;
        }

        .footer-nav a {
            color: #718096;
            text-decoration: none;
            transition: 0.2s;
        }

        .footer-nav a:hover {
            color: var(--tripplan-gold);
            text-decoration: underline;
        }

        .cat-step {
            font-size: 1.2rem;
            margin-bottom: 5px;
            display: block;
        }
    </style>
</head>
<body>

<div class="menu-container">
    <span class="cat-step">🐾</span>
    <img src="img/Gemini_Generated_Image_ifam6eifam6eifam.png" alt="TripPlan Logo" class="logo-main">
    
    <h2>旅行計画</h2>

    <div class="menu-grid">
        <a href="${pageContext.request.contextPath}/TripServlet" class="btn-menu">
            <span>📝</span> 旅の計画を新規作成
        </a>

        <a href="${pageContext.request.contextPath}/TripListServlet" class="btn-menu">
            <span>📖</span> 作成済みの計画を参照
        </a>

        <%-- ?tripId=1 を付与することで、一覧に戻されるのを防ぎます --%>
        <a href="${pageContext.request.contextPath}/MissionServlet?tripId=1" class="btn-menu btn-mission">
            <span>🚩</span> 現在のMISSION（貯蓄中）
        </a>
    </div>

    <div class="footer-nav">
        <a href="${pageContext.request.contextPath}/LogoutServlet">🚪 システムをログアウトする</a>
    </div>
</div>

</body>
</html>