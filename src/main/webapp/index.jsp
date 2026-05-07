<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    // 起動時にメニュー画面（tripplan.jsp）へジャンプさせる
    request.getRequestDispatcher("login.jsp").forward(request, response);
%>