import React, { useEffect, useState } from 'react'; // Reactの基本的な機能をインポート
import './App.css'; // CSSスタイルを読み込み

// -----------------------------
// 定数や型定義
// -----------------------------

// 迷路の横幅と高さ（奇数にすると通路と壁を交互にできる）
const MAZE_WIDTH = 21;
const MAZE_HEIGHT = 21;

// セルの型：0は「壁」、1は「通路」として扱う
type Cell = 0 | 1;

// 迷路は、Cell（二次元配列）の配列として表現
type Maze = Cell[][];

// プレイヤーの初期位置（左上の通路）
const START_X = 1;
const START_Y = 1;

// ゴールの位置（右下の通路）
const GOAL_X = MAZE_WIDTH - 2;
const GOAL_Y = MAZE_HEIGHT - 2;

// -----------------------------
// 迷路を自動生成する関数
// -----------------------------

// 深さ優先探索アルゴリズムを使って迷路を生成する
const generateMaze = (width: number, height: number): Maze => {
  // すべて壁（0）で初期化された迷路を作成
  const maze: Maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0)
  );

  // プレイヤーの開始地点をスタックに入れる（探索の起点）
  const stack: [number, number][] = [[START_X, START_Y]];

  // 開始地点は通路（1）に設定
  maze[START_Y][START_X] = 1;

  // 探索に使う移動方向（上下左右に2マスずつ移動）
  const directions = [
    [2, 0],   // 右へ2マス
    [-2, 0],  // 左へ2マス
    [0, 2],   // 下へ2マス
    [0, -2],  // 上へ2マス
  ];

  // 配列をランダムにシャッフルする関数
  const shuffle = (arr: any[]) =>
    arr.sort(() => Math.random() - 0.5);

  // スタックが空になるまで探索を繰り返す
  while (stack.length) {
    const [x, y] = stack.pop()!; // 現在の位置を取り出す

    // ランダムな順で隣接マスを探索
    shuffle(directions).forEach(([dx, dy]) => {
      const nx = x + dx; // 次のX座標
      const ny = y + dy; // 次のY座標

      // 次のマスがまだ未探索（壁）であれば
      if (maze[ny]?.[nx] === 0) {
        maze[ny][nx] = 1; // 新しい場所を通路にする
        maze[y + dy / 2][x + dx / 2] = 1; // 間の壁を壊して道をつなぐ
        stack.push([nx, ny]); // 新しい地点をスタックに追加して再帰的に進める
      }
    });
  }

  // ゴール地点も通路にしておく（たまに塞がれることがあるので明示的に）
  maze[GOAL_Y][GOAL_X] = 1;

  // 完成した迷路を返す
  return maze;
};

// -----------------------------
// Reactコンポーネントの定義
// -----------------------------

const App: React.FC = () => {
  // 迷路の状態（2次元配列）を管理
  const [maze, setMaze] = useState<Maze>([]);

  // プレイヤーの現在位置を管理（X座標とY座標）
  const [playerX, setPlayerX] = useState(START_X);
  const [playerY, setPlayerY] = useState(START_Y);

  // コンポーネントがマウントされた時に迷路を生成して状態にセット
  useEffect(() => {
    setMaze(generateMaze(MAZE_WIDTH, MAZE_HEIGHT));
  }, []);

  // キーボード操作を検知してプレイヤーを動かす処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); // ← ブラウザが矢印キーでスクロールしないように防止

      // 次に移動する予定の座標（初期値は現在位置）
      let nx = playerX;
      let ny = playerY;

      // 押されたキーに応じて移動方向を決定
      if (e.key === 'ArrowUp') ny -= 1;
      if (e.key === 'ArrowDown') ny += 1;
      if (e.key === 'ArrowLeft') nx -= 1;
      if (e.key === 'ArrowRight') nx += 1;

      // 移動先が通路（1）であればプレイヤーの位置を更新
      if (maze[ny]?.[nx] === 1) {
        setPlayerX(nx);
        setPlayerY(ny);
      }
    };

    // イベントリスナーを登録
    window.addEventListener('keydown', handleKeyDown);

    // コンポーネントがアンマウントされるときにリスナーを解除
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerX, playerY, maze]); // 依存配列にプレイヤー位置と迷路を指定

  // -----------------------------
  // 描画処理
  // -----------------------------
  return (
    <div className="maze">
      {maze.map((row, y) =>
        row.map((cell, x) => {
          // 現在のマスがプレイヤー位置かどうか
          const isPlayer = x === playerX && y === playerY;

          // 現在のマスがゴールかどうか
          const isGoal = x === GOAL_X && y === GOAL_Y;

          // 各マスを <div> 要素として描画し、クラス名でスタイルを変更
          return (
            <div
              key={`${x}-${y}`} // 各マスのキーを座標で一意に設定
              className={
                isPlayer
                  ? 'cell player' // プレイヤーなら青色
                  : isGoal
                    ? 'cell goal' // ゴールなら赤色
                    : cell === 1
                      ? 'cell path' // 通路なら白
                      : 'cell wall' // 壁なら黒
              }
            />
          );
        })
      )}
    </div>
  );
};

export default App;
