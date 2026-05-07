<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>旅行計画 - MISSION</title>
<style>
    /* 全体の背景（メインメニューと統一） */
    body { background-color: #fdf5e6; font-family: sans-serif; display: flex; justify-content: center; }
    .container { width: 400px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-top: 50px; }
    
    /* 貯金ミッション部分 */
    .savings-box { background: #fffde7; border: 2px solid #ffd700; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
    .daily-goal { font-size: 1.2em; font-weight: bold; color: #ff8c00; }

    /* ミッションリスト */
    .mission-item { padding: 10px; margin: 10px 0; border-radius: 8px; border-left: 8px solid; }
    
    /* 状態による色分け（ここがポイント！） */
    .status-red { background-color: #ffebee; border-left-color: #ff4d4d; color: #cc0000; }     /* 未達成：赤 */
    .status-teal { background-color: #e0f2f1; border-left-color: #20b2aa; color: #008080; }    /* 成功：青緑 */

    .category-tag { font-size: 0.8em; background: #eee; padding: 2px 5px; border-radius: 4px; }
</style>
</head>
<body>

<div class="container">
    <h2>現在のMISSION</h2>

    <div class="savings-box">
        <p>出発まであと <strong>${daysRemaining}</strong> 日</p>
        <p>1日の目標貯金額</p>
        <div class="daily-goal">¥ ${dailyGoal}</div>
        <p><small>(総額 ¥${trip.totalBudget} / 現在 ¥${currentSavings})</small></p>
    </div>

    <c:forEach var="m" items="${missionList}">
        <div class="mission-item ${m.completed ? 'status-teal' : 'status-red'}">
            <span class="category-tag">${m.category}</span>
            <strong>${m.title}</strong>
            <div style="text-align: right; font-size: 0.8em;">
                ${m.completed ? '● MISSION COMPLETE' : '○ IN PROGRESS'}
            </div>
        </div>
    </c:forEach>

    <div style="text-align: center; margin-top: 20px;">
        <a href="index.jsp" style="text-decoration: none; color: #666;">← 戻る</a>
    </div>
</div>

</body>
</html>