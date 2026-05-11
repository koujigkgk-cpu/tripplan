<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TripPlan - 🐾 現在のMISSION</title>
    <style>
        :root {
            --tripplan-gold: #c08a10;
            --tripplan-bg-dark: #0a4d52; 
            --tripplan-bg-light: #166d74;
            --tripplan-input-bg: #f8fafc;
            --status-red: #e53e3e;
            --status-teal: #20b2aa;
        }

        body {
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
            width: 420px; 
            background: white; 
            border-radius: 24px; 
            padding: 35px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.3); 
            border-top: 8px solid var(--tripplan-gold);
        }

        .header { text-align: center; margin-bottom: 25px; }
        h2 { color: var(--tripplan-gold); font-size: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold; }

        .savings-box { 
            background: var(--tripplan-input-bg); 
            border: 1px solid #e2e8f0;
            padding: 20px; border-radius: 16px; margin-bottom: 25px; text-align: center; 
        }

        .days-left { font-size: 0.9rem; color: #718096; margin-bottom: 10px; }
        .days-left strong { color: var(--tripplan-bg-dark); font-size: 1.2rem; }
        .daily-goal { font-size: 1.8rem; font-weight: bold; color: var(--tripplan-gold); margin: 10px 0; }
        .savings-summary { font-size: 0.75rem; color: #a0aec0; }

        .mission-item { 
            padding: 15px; margin: 12px 0; border-radius: 12px; border-left: 6px solid; 
            display: flex; flex-direction: column; gap: 5px; transition: 0.3s;
        }
        
        .status-red { background-color: #fff5f5; border-left-color: var(--status-red); color: #9b2c2c; }
        .status-teal { background-color: #f0fff4; border-left-color: var(--status-teal); color: #234e52; }

        .category-tag { align-self: flex-start; font-size: 0.7rem; background: rgba(0,0,0,0.1); padding: 2px 8px; border-radius: 4px; font-weight: bold; }
        .mission-status { text-align: right; font-size: 0.75rem; font-weight: bold; margin-top: 5px; }

        .btn-back { 
            display: block; text-align: center; margin-top: 25px; text-decoration: none; 
            color: var(--tripplan-gold); font-weight: bold; font-size: 0.9rem; padding-top: 20px; border-top: 1px solid #f0f0f0;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2>🚩 現在のMISSION</h2>
    </div>

    <div class="savings-box">
        <div class="days-left">出発まであと <strong>${daysRemaining}</strong> 日</div>
        <div style="font-size: 0.85rem; color: #4a5568;">1日の目標貯金額</div>
        <div class="daily-goal">¥ ${dailyGoal}</div>
        <div class="savings-summary">
            総額 ¥${trip.totalBudget} / 現在 ¥${currentSavings}
        </div>
    </div>

    <div class="mission-list">
        <c:forEach var="m" items="${missionList}">
            <%-- 型変換エラーを避けるため、直接プロパティを参照 --%>
            <div class="mission-item ${m.completed ? 'status-teal' : 'status-red'}">
                <span class="category-tag">${m.category}</span>
                <strong style="font-size: 1rem;">${m.title}</strong>
                <div class="mission-status">
                    ${m.completed ? '● MISSION COMPLETE' : '○ IN PROGRESS'}
                </div>
            </div>
        </c:forEach>
    </div>

    <a href="tripplan.jsp" class="btn-back">← メインメニューに戻る</a>
</div>

</body>
</html>