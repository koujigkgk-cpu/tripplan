# 実行環境として Tomcat 9 を使用
FROM tomcat:9.0-jdk11-openjdk-slim

# 日本時間に設定
ENV TZ=Asia/Tokyo

# プロジェクトの webapp フォルダの中身を Tomcat の公開ディレクトリに丸ごとコピー
# image_efb37a.jpg の構造に基づき、src/main/webapp をコピーします
COPY src/main/webapp/ /usr/local/tomcat/webapps/ROOT/

# もし Java ファイル（サーブレットなど）をコンパイルした .class ファイルがある場合、それもコピー
# 通常は build/classes や bin に生成されます
COPY bin/ /usr/local/tomcat/webapps/ROOT/WEB-INF/classes/

EXPOSE 8080
CMD ["catalina.sh", "run"]