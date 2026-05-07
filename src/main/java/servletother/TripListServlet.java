package servletother;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import DAOother.PlanDAO;
import modelother.Expense;
import modelother.Plan;

@WebServlet("/TripListServlet")
public class TripListServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idStr = request.getParameter("id");
        PlanDAO dao = new PlanDAO();

        if (idStr != null) {
            // 【1件表示モード】（詳細画面 createplan.jsp へ）
            try {
                int id = Integer.parseInt(idStr);

                // ★ Plan（距離・時間・経由地）を取得
                Plan plan = dao.getPlanById(id);
                request.setAttribute("plan", plan);

                // ★ 合計費用（hotelOut, foodOut など）を取得
                Map<String, Integer> budgets = dao.getBudgetsByTripId(id);

                request.setAttribute("hotelOut", budgets.getOrDefault("hotelOut", 0));
                request.setAttribute("foodOut", budgets.getOrDefault("foodOut", 0));
                request.setAttribute("otherOut", budgets.getOrDefault("otherOut", 0));
                request.setAttribute("transOut", budgets.getOrDefault("transOut", 0));

                request.setAttribute("hotelRet", budgets.getOrDefault("hotelRet", 0));
                request.setAttribute("foodRet", budgets.getOrDefault("foodRet", 0));
                request.setAttribute("otherRet", budgets.getOrDefault("otherRet", 0));
                request.setAttribute("transRet", budgets.getOrDefault("transRet", 0));

                // ★ 追加：詳細費用一覧（宿泊費・食費・その他の各行）
                List<Expense> expenses = dao.getExpenseList(id);
                request.setAttribute("expenses", expenses);

            } catch (NumberFormatException e) {
                e.printStackTrace();
            }

            request.getRequestDispatcher("/WEB-INF/jsp/createplansaved.jsp").forward(request, response);
            
        } else {
            // 【一覧表示モード】（全件取得して triplist.jsp へ）
            List<Plan> planList = dao.getAllPlans(); 
            
            request.setAttribute("tripList", planList);
            request.setAttribute("planList", planList); // 互換用
            
            request.getRequestDispatcher("/WEB-INF/jsp/triplist.jsp").forward(request, response);
        }
    }
}
