package servletother;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import DAOother.UserDAO;

@WebServlet("/UserRegisterServlet")
public class UserRegisterServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        String userId = request.getParameter("userId");
        String pass = request.getParameter("pass");
        String passConfirm = request.getParameter("passConfirm");

        // 1. パスワード一致チェック
        if (!pass.equals(passConfirm)) {
            request.setAttribute("error", "パスワードが一致しません🐾");
            request.getRequestDispatcher("signup.jsp").forward(request, response);
            return;
        }

        // 2. DBに保存
        UserDAO dao = new UserDAO();
        boolean success = dao.registerUser(userId, pass);

        if (success) {
            // 登録成功したら、メッセージをつけてログイン画面へ
            request.setAttribute("error", "登録完了！ログインしてね🐾"); // error枠を流用
            request.getRequestDispatcher("login.jsp").forward(request, response);
        } else {
            // ID重複などのエラー
            request.setAttribute("error", "そのIDは使えません🐾");
            request.getRequestDispatcher("signup.jsp").forward(request, response);
        }
    }
}