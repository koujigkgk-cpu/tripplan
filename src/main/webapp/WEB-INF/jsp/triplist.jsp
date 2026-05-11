<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 📖 保存済みの計画</title>
    <style>
        :root {
            --tripplan-gold: #c08a10;
            --tripplan-bg-dark: #0a4d52; 
            --tripplan-bg-light: #166d74;
            --tripplan-input-bg: #f8fafc;
        }

        body {
            /* 全画面共通の深みのあるグラデーション */
            background: radial-gradient(circle at center, var(--tripplan-bg-light) 0%, var(--tripplan-bg-dark) 100%) !important;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            margin: 0;
            padding: 40px 20px;
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
        }

        .container { 
            width: 480px; 
            background: white; 
            border-radius: 24px; 
            padding: 35px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.3); 
            border-top: 8px solid var(--tripplan-gold);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo-small {
            width: 120px;
            height: auto;
            margin-bottom: 10px;
            filter: brightness(1.15) contrast(1.2);
            mix-blend-mode: multiply;
        }

        h2 { 
            color: var(--tripplan-gold); 
            text-align: center; 
            font-size: 1.5rem;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .trip-list {
            margin-top: 20px;
        }
        
        .trip-card {
            background: var(--tripplan-input-bg); 
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 18px; 
            margin-bottom: 15px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            transition: all 0.3s ease; 
            text-decoration: none; 
            color: inherit;
        }

        .trip-card:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 8px 20px rgba(0,0,0,0.1); 
            border-color: var(--tripplan-gold);
            background: white;
        }

        .trip-info { flex: 1; }
        
        .trip-dest { 
            font-weight: bold; 
            font-size: 1.1rem; 
            color: var(--tripplan-bg-dark); 
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .trip-date { 
            font-size: 0.85rem; 
            color: #718096; 
            margin-top: 6px; 
        }

        .trip-action { 
            font-weight: bold; 
            color: var(--tripplan-gold); 
            font-size: 0.85rem;
            background: white;
            padding: 6px 14px;
            border-radius: 20px;
            border: 1.5px solid var(--tripplan-gold);
            transition: 0.3s;
        }

        .trip-card:hover .trip-action {
            background: var(--tripplan-gold);
            color: white;
        }
        
        .btn-back { 
            display: block; 
            text-align: center; 
            margin-top: 25px; 
            text-decoration: none; 
            color: var(--tripplan-gold); 
            font-weight: bold; 
            font-size: 0.9rem;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
        }

        .empty-msg {
            text-align: center;
            padding: 40px 20px;
            color: #a0aec0;
            font-style: italic;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <img src="img/Gemini_Generated_Image_ifam6eifam6eifam.png" alt="Logo" class="logo-small">
        <h2>📖 保存済みの計画</h2>
    </div>
    
    <div class="trip-list">
        <%-- Servletから渡された planList が空の場合 --%>
        <c:if test="${empty planList}">
            <p class="empty-msg">まだ計画がありません🐾<br>新しい旅をここから始めましょう。</p>
        </c:if>

        <%-- Servletから渡された planList をループ --%>
        <c:forEach var="trip" items="${planList}">
            <a href="${pageContext.request.contextPath}/TripListServlet?id=${trip.id}" class="trip-card">
                <div class="trip-info">
                    <div class="trip-dest">📍 ${trip.destination}</div>
                    <div class="trip-date">旅の計画 ID: ${trip.id}</div>
                </div>
                <div class="trip-action">詳細を表示 🐾</div>
            </a>
        </c:forEach>
    </div>

    <a href="tripplan.jsp" class="btn-back">← メインメニューに戻る</a>
</div>

</body>
</html>