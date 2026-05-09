# Mavenを使ってビルドと実行を同時に行う設定（targetフォルダがGitHubになくても動く方式）

# --- ステージ1：ビルド ---
FROM maven:3.8.4-openjdk-11-slim AS build
COPY . /app
WORKDIR /app
RUN mvn clean package -DskipTests

# --- ステージ2：実行 ---
FROM tomcat:9.0-jdk11-openjdk-slim
ENV TZ=Asia/Tokyo

# ステージ1で作成されたWARファイルをTomcatにコピー
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]