
フォルダは多分こんな感じ
簡易設計
・画面一覧（ページ構成）
  ・認証画面
  ・メイン画面
  ・おすすめ紹介画面
  ・登録画面
  ・登録一覧
  ・編集画面
  ・プロフィール画面
  ・設定画面


・機能一覧（できること）
  ・サインイン、サインアップ
  ・レコメンド結果、視聴希望映画の表示
  ・タイトル＋年“外部検索から補完”、ジャンル、視聴済/視たい、評価、感想、視聴日の登録
  ・登録映画、外部リンクの表示、検索フィルタ機能、選択して編集へ移動
  ・登録内容の変更/削除、
  ・プロフィール画面の表示、設定画面へ移動
  ・プロフィール設定、特定ジャンルの表示/非表示、外部サイト設定

・データ設計（ざっくりDB）
  ・ER概要
      ・movies
      ・user_movies
      ・user_reviews
      ・recommend_movies
  ・テーブル
      ・movies
          ・id
          ・title
          ・year
          ・genres
          ・tmdb_id
          ・imdb_id
          ・updated_at
       ・user_movies
          ・id
          ・user_id
          ・movie_id
          ・status
          ・memo
          ・watched_at
          ・created_at
          ・updated_at
      ・user_reviews
          ・id
          ・user_id
          ・movie_id
          ・rating
          ・memo
          ・updated_at
      ・recommend_movies
          ・movie_id
          ・genre_id
          ・rating_id


To Do memo

・tmdbの追加

・別ユーザーの同映画重複登録禁止コード
    insert into movies (title, year, genres)
    values (_title, _year, _genres)

    on conflict (title, year)
    do update set title = excluded.title

    returning id;

・デザインの調整