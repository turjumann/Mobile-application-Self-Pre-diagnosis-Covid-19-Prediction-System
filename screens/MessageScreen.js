import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { View, TouchableOpacity } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import Text from "../components/Text";
import { db } from "../backend/firebase";
import firebase from "firebase";
import { FontAwesome5 } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";

export default MessageScreen = ({ route, navigation }) => {
  const dbs = firebase.firestore;
  const { params } = route;
  const { guestId, guestName, guestSurname, currentUserID } = params;
  const [msgValue, setMsgValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [currId, setCurrId] = useState();

  const getCardsInfo = async () => {
    await db
      .collection("allUsers")
      .doc(currentUserID)
      .get()
      .then((querySnapshot) => {
        let newData = {
          id: querySnapshot.id,
          name: querySnapshot.data().name,
          surname: querySnapshot.data().surname,
          age: querySnapshot.data().age,
          sex: querySnapshot.data().sex,
          profilePhoto: querySnapshot.data().profilePhotoUrl,
        };
        if (newData?.age === undefined) {
          console.log("from doctor in messages");
          return true;
        }
      });
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackTitle: "Back",
      headerTintColor: "#222222",

      headerTitle: () => (
        <Text medium bold color="#222222">
          {guestName + " " + guestSurname}
        </Text>
      ),
    });
  });
  useEffect(() => {
    // getAllMessages

    const docId =
      currentUserID > guestId
        ? guestId + " " + currentUserID
        : currentUserID + " " + guestId;
    const messageRef = db
      .collection("chatrooms")
      .doc(docId)
      .collection("messages")
      .orderBy("createdAt", "desc");

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map((docSanp) => {
        const data = docSanp.data();
        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate(),
          };
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date(),
          };
        }
      });
      setMessages(allmsg);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  const onSend = (messageArray) => {
    const msg = messageArray[0];
    const myMsg = {
      ...msg,
      sentBy: currentUserID,
      sentTo: guestId,
      createdAt: new Date(),
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, myMsg)
    );
    const docId =
      currentUserID > guestId
        ? guestId + " " + currentUserID
        : currentUserID + " " + guestId;

    db.collection("chatrooms")
      .doc(docId)
      .collection("messages")
      .add({ ...myMsg, createdAt: dbs.FieldValue.serverTimestamp() });
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <GiftedChat
        messages={messages}
        onSend={(text) => onSend(text)}
        user={{
          _id: currentUserID,
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                right: {
                  color: "white",
                },
                left: {
                  color: "black",
                },
              }}
              wrapperStyle={{
                right: {
                  backgroundColor: "#95999E",
                  color: "",
                },
                left: {
                  backgroundColor: "#FAFAFA",
                },
              }}
            />
          );
        }}
        renderInputToolbar={(props) => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{
                borderTopWidth: 1.0,
                borderTopColor: "#BEC3CC",
              }}
              textInputStyle={{ color: "black" }}
            />
          );
        }}
      />
    </View>
  );
};

//THUQdkImzFVOv2LqHvxdSn3RDLY2-jxgISB0nWgRmtfu2OIn1BIVlBMu1
