export const Wapi = () => {
  const element = document.querySelector(".Text"); // アニメーションを適用する要素を取得

  const keyframes = [
    { opacity: 0 }, // 初期状態（opacity: 0）
    { opacity: 1 }, // 終了状態（opacity: 1）
  ];

  const options = {
    duration: 400, // アニメーションの時間（ミリ秒）
    easing: "ease-in", // イージング関数（例えば、'ease-in', 'linear'など）
    iterations: Infinity,
  };
  element.animate(keyframes, options); // アニメーションを開始
};
