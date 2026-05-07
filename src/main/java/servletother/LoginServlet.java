package servletother;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import DAOother.UserDAO;
import modelother.User;

/**
 * ログイン機能を制御するサーブレット
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * ログインフォームからの送信処理 (POST)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 1. フォームからの入力値取得
        String userId = request.getParameter("user");
        String pass = request.getParameter("pass");

        // 2. DAOを使ってデータベースからユーザーを検索
        UserDAO dao = new UserDAO();
        User loginUser = dao.findByUser(userId, pass);

        // 3. 判定
        if (loginUser != null) {
            // 【成功】
            // セッションを開始し、ユーザー情報をオブジェクトとして格納
            HttpSession session = request.getSession();
            session.setAttribute("loginUser", loginUser);
            
            // メニュー画面（tripplan.jsp）へリダイレクト
            response.sendRedirect("tripplan.jsp"); 
            
        } else {
            // 【失敗】
            // エラーメッセージをセットしてログイン画面（login.jsp）へ戻る
            request.setAttribute("error", "ユーザーIDまたはパスワードが違います🐾");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }

    /**
     * 直接URLにアクセスされた場合 (GET)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // 直接アクセスされた場合は、ログイン画面を表示させる
        response.sendRedirect("login.jsp");
    }
}