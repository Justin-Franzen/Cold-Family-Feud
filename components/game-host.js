import { useState, useEffect, useRef } from "react";
import "tailwindcss/tailwind.css";
import { useTranslation } from "react-i18next";
import "../i18n/i18n";


let timerInterval = null;

export default function Buzzer(props) {
  const { i18n, t } = useTranslation();
  const [error, setError] = useState();
  let refreshCounter = 0;

  let game = props.game;
  let ws = props.ws;

  const send = function (data) {
    data.room = props.room;
    data.id = props.id;
    ws.current.send(JSON.stringify(data));
  };

  useEffect(() => {
    setInterval(() => {
      if (ws.current.readyState === 3) {
        setError(
          `lost connection to server refreshing in ${10 - refreshCounter}`
        );
        refreshCounter++;
        if (refreshCounter >= 10) {
          location.reload();
        }
      } else {
        setError("");
      }
    }, 1000);
    console.debug(game);

    if (props.id !== null && props.team !== null) {
      setBuzzerReg(props.id);
    }

    ws.current.addEventListener("message", (evt) => {
      let received_msg = evt.data;
      let json = JSON.parse(received_msg);
      if (json.action === "ping") {
        // server gets the average latency periodically
        console.debug(props.id);
        send({ action: "pong", id: props.id });
      } else if (json.action === "quit") {
        props.setGame(null);
        props.setTeam(null);
      } else if (json.action === "data") {
        if (json.data.title_text === "Change Me") {
          json.data.title_text = t("changeMe");
        }
        if (json.data.teams[0].name === "Team 1") {
          json.data.teams[0].name = `${t("team")} ${t("number", { count: 1 })}`;
        }
        if (json.data.teams[1].name === "Team 2") {
          json.data.teams[1].name = `${t("team")} ${t("number", { count: 2 })}`;
        }
        props.setGame(json.data);
      } else if (json.action === "change_lang") {
        console.debug("Language Change", json.data);
        i18n.changeLanguage(json.data);
      } else if (json.action === "registered") {
        console.debug(props.id);
        send({ action: "pong", id: props.id });
        setBuzzerReg(props.id);
      } else {
        console.debug("didnt expect action in buzzer: ", json);
      }
    });
  }, []);

  if (game.teams != null && game.rounds != null) {
    console.debug(game);
    return (
      <div
        class="flex flex-col min-w-full"
        style={{
          minWidth: "100vh",
        }}
      >
        <button
          class="shadow-md rounded-lg p-2 m-5 bg-gray-200 text-2xl font-bold uppercase"
          style={{ alignSelf: "flex-end" }}
          onClick={() => {
            send({ action: "quit" });
          }}
        >
          {t("quit")}
        </button>
        {game.is_final_round ? (
          <div class="p-5">
            {game.final_round?.map((q) => (
              <div class="flex-col flex space-y-5 p-2 border-2">
                <br />
                <p class="text-4xl font-bold ">{q.question}</p>
                {game.is_final_second ? (
                  <p class="text-3xl text-center"> {q.answers[0][0]} - {q.answers[0][1]}</p>
                ) : (<div></div>)}
              </div>
            ))}
          </div>
        ) : (
          <div class="p-5">
            <div class="flex-col flex space-y-5 p-12 border-2">
              <p class="text-3xl text-center">{game.rounds[game.round].answers.length} answers on the board</p>
              <p class="text-4xl font-bold ">{game.rounds[game.round].question}</p>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <p>{t("loading")}</p>
      </div>
    );
  }
}
