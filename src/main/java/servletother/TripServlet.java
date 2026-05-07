package servletother;

import java.io.IOException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import modelother.Plan;

@WebServlet("/TripServlet")
public class TripServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");

		// 1. デフォルト設定（広島駅）
		Plan plan = new Plan();
		String start = request.getParameter("start");
		
		// 値が届いている時だけセットする（空ならデフォルトを入れるが、上書きはしない）
		if (start != null && !start.isEmpty()) {
		    plan.setStart(start);
		} else {
		    plan.setStart("広島駅"); 
		}
		String dest = request.getParameter("dest");

		if (dest != null && !dest.isEmpty()) {
		    plan.setDestination(dest);
		} else {
		    plan.setDestination("博多駅"); // 指定がない時だけの初期値
		}
		// 2. モデル(Plan)を作成してデータを詰める
		
		if (plan.getOriginLat() == 0.0) {
		    plan.setOriginLat(34.3976);
		    plan.setOriginLng(132.4754);
		}
		if (plan.getDestLat() == 0.0) {
		    plan.setDestLat(33.5897);
		    plan.setDestLng(130.4207);
		}

		// 3. JSPへ渡すためにリクエストスコープに保存
		request.setAttribute("plan", plan);

		// 4. 地図画面（createplan.jsp）を表示する
		// ※フォルダ名が小文字の jsp であることを確認してください
		RequestDispatcher dispatcher = request.getRequestDispatcher("/WEB-INF/jsp/createplan.jsp");
		dispatcher.forward(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		String action = request.getParameter("action");

		// --- A. 住所取得リクエスト（非同期通信）の場合 ---
		if ("getAddress".equals(action)) {
			String lat = request.getParameter("lat");
			String lon = request.getParameter("lon");
			String urlStr = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon
					+ "&zoom=14";

			try {
				java.net.URL url = new java.net.URL(urlStr);
				java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
				conn.setRequestMethod("GET");
				conn.setRequestProperty("User-Agent", "MyTripPlanApp/1.0");

				java.io.BufferedReader in = new java.io.BufferedReader(
						new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
				StringBuilder responseBody = new StringBuilder();
				String line;
				while ((line = in.readLine()) != null) {
					responseBody.append(line);
				}
				in.close();

				response.setContentType("application/json; charset=UTF-8");
				response.getWriter().write(responseBody.toString());
				return; // ここで終了。JSPへは飛ばない
			} catch (Exception e) {
				e.printStackTrace();
				response.sendError(500);
				return;
			}
		}

		// --- B. それ以外（通常の画面表示など）の場合は doGet へ ---
		doGet(request, response);
	}
}