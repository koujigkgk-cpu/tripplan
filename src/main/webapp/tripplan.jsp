<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>旅行計画 - メインメニュー</title>
    <style>
        body { font-family: "Meiryo", sans-serif; background-color: #fdf5e6; color: #5a4a42; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .container { width: 400px; padding: 30px; background: white; border-radius: 20px; border: 2px solid #eec; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
        h2 { color: #d2691e; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; }
        .menu-grid { display: flex; flex-direction: column; gap: 15px; margin-top: 25px; }
        
        /* 共通ボタン形式 */
        .btn-menu { 
            display: flex; align-items: center; justify-content: center; gap: 10px;
            padding: 20px; background: #fffdf0; border: 2px solid #ffcc00; 
            border-radius: 15px; text-decoration: none; color: #5a4a42; font-weight: bold; transition: 0.3s;
        }
        .btn-menu:hover { background: #ffcc00; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        
        /* MISSIONボタン専用（青色系） */
        .btn-mission { border-color: #4a90e2; color: #4a90e2; }
        .btn-mission:hover { background: #4a90e2; color: white; }
        
        .cat-icon { font-size: 3em; }
    </style>
</head>
<body>

<div class="container">
    <div class="cat-icon">🐾</div>
    <h2>旅行計画</h2>

    <div class="menu-grid">
        <a href="${pageContext.request.contextPath}/TripServlet" class="btn-menu">
            <span>📝</span> 旅の計画を新規作成
        </a>

        <a href="${pageContext.request.contextPath}/TripListServlet" class="btn-menu">
    <span>📖</span> 作成済みの計画を参照
</a>

        <a href="${pageContext.request.contextPath}/MissionServlet" class="btn-menu btn-mission">
            <span>🚩</span> 現在のMISSION（貯蓄中）
        </a>
    </div>
</div>

</body>
</html>