import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { AiOutlineSend } from "react-icons/ai";
import axios from "axios";
import { baseURL } from "../../Urls.js";

const ChatContainer = ({ currentChatUser }) => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser.user;
  const id = user._id;

  const [message, setMessage] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const srcollRef = useRef();
  const socket = useRef(null);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const getMessage = async () => {
    try {
      const { data } = await axios.get(
        `/api/post/get/chat/msg/${id}/${currentChatUser._id}`
      );
      setMessage(data.allMessage);
    } catch (error) {
      console.log(error);
      // toast.error("Xảy ra lỗi khi nhận dữ liệu");
    }
  };

  useEffect(() => {
    if (currentChatUser !== "") {
      socket.current = io(baseURL);
      socket.current.emit("addUser", id);
    }
  }, [id, currentChatUser]);

  useEffect(() => {
    getMessage();
  }, [currentChatUser, id]);

  const sendMessage = () => {
    const messages = {
      myself: true,
      message: inputMessage,
    };
    socket.current.emit("send-msg", {
      to: currentChatUser._id,
      from: id,
      message: inputMessage,
    });
    axios.post(`/api/post/msg`, {
      from: id,
      to: currentChatUser._id,
      message: inputMessage,
    });
    setMessage((prevMessages) => [...prevMessages, messages]);
  };

  useEffect(() => {
    srcollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({ myself: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessage((prevMessages) => [...prevMessages, arrivalMessage]);
  }, [arrivalMessage]);

  const formatMessageTime = (createdAt) => {
    const messageDate = new Date(createdAt);
    const currentDate = new Date();

    if (
      messageDate.getDate() === currentDate.getDate() &&
      messageDate.getMonth() === currentDate.getMonth() &&
      messageDate.getFullYear() === currentDate.getFullYear()
    ) {
      return messageDate.toLocaleTimeString();
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#29292a] shadow-lg rounded-lg">
      <div className="flex items-center bg-white dark:bg-[#29292a] shadow-lg rounded-lg m-1 p-2">
        <img
          src={currentChatUser?.profilePicture}
          alt=""
          className="h-10 w-10 rounded-full"
        />
        <span className="ml-2">{currentChatUser?.username}</span>
      </div>

      <div className="h-[70vh] overflow-hidden overflow-y-auto ">
        {message?.map((item, index) => (
          <div key={index} ref={srcollRef} className="m-1 flex justify-end ">
            <div
              className={`flex items-center ${
                item.myself ? "justify-end" : ""
              } bg-white dark:bg-[#29292a] shadow-lg rounded-lg p-2 w-2/5`}
            >
              {!item.myself && (
                <img
                  alt=""
                  src={currentChatUser?.profile}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="ml-2">{item.message}</span>
              <span className="ml-2 text-sm text-gray-500">
                {formatMessageTime(item.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center border-t-2 shadow-md  rounded-lg p-2  ">
        <input
          className="flex-grow m-2 p-3 border-[2px] rounded-lg focus:outline-none text-black"
          placeholder="Viết tin nhắn vào đây..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 px-14 rounded-full ml-2 flex justify-center items-center gap-2 hover:bg-blue-700 hover:scale-110"
          onClick={sendMessage}
        >
          <AiOutlineSend />
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
