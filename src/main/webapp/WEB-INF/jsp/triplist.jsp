<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>保存済みの計画一覧</title>
    <style>
        body { 
            font-family: "Meiryo", sans-serif; 
            background-color: #fdf5e6; 
            color: #5a4a42; 
            margin: 0; 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
        }
        .container { 
            width: 450px; 
            background: white; 
            border-radius: 20px; 
            padding: 25px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            border: 2px solid #eec; 
        }
        h2 { 
            color: #d2691e; 
            text-align: center; 
            border-bottom: 2px solid #ffcc00; 
            padding-bottom: 10px; 
        }
        
        .trip-card {
            background: #fffdf0; 
            border: 1px solid #ffcc00; 
            border-radius: 12px;
            padding: 15px; 
            margin-bottom: 15px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            transition: 0.3s; 
            text-decoration: none; 
            color: inherit;
        }
        .trip-card:hover { 
            transform: translateY(-3px); 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
            background: #ffcc00; 
        }
        .trip-info { flex: 1; }
        .trip-dest { font-weight: bold; font-size: 1.1em; color: #5a4a42; }
        .trip-date { font-size: 0.85em; color: #888; margin-top: 5px; }
        .trip-budget { font-weight: bold; color: #d2691e; }
        
        .btn-back { 
            display: block; 
            text-align: center; 
            margin-top: 20px; 
            text-decoration: none; 
            color: #d2691e; 
            font-weight: bold; 
        }
        .empty-msg {
            text-align: center;
            padding: 20px;
            color: #888;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>📖 保存済みの計画</h2>
    
    <%-- Servletから渡された planList が空の場合 --%>
    <c:if test="${empty planList}">
        <p class="empty-msg">まだ計画がありません🐾</p>
    </c:if>

    <%-- Servletから渡された planList をループ --%>
    <c:forEach var="trip" items="${planList}">
        <a href="${pageContext.request.contextPath}/TripListServlet?id=${trip.id}" class="trip-card">
            <div class="trip-info">
                <div class="trip-dest">📍 ${trip.destination}</div>
                <div class="trip-date">旅の計画 ID: ${trip.id}</div>
            </div>
            <div class="trip-budget">詳細を表示 🐾</div>
        </a>
    </c:forEach>

    <a href="tripplan.jsp" class="btn-back">← メインメニューに戻る</a>
</div>

</body>
</html>