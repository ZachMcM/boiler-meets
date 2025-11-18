import { Socket } from "socket.io";
import { logger } from "../logger";
import { io } from "..";
import { WebRTCOffer, WebRTCAnswer, WebRTCIceCandidate } from "../types/webrtc";
import { RoomManager } from "../utils/room-manager";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { matches, user } from "../db/schema";
import { redis } from "../redis";
import { headsupItems } from "../data/headsupItems";
import { HeadsupGameState, TicTacToeGameState } from "../types/gameState";
import { checkWinner, checkTie } from "../utils/tictactoe";

const gameTurnTimeouts = new Map<string, NodeJS.Timeout>();

export async function videoChatHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string | undefined;
  let roomId = socket.handshake.auth.roomId as string | string[] | undefined;
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutMs = 60000; // DEBUG TIMEOUT INTERVALS: 60,000 = 1 minute
  const callAgainTimeout = 60000 * 5;
  // const timeoutMs = 300000; // Normal timeout intervals
  // const callAgainTimeout = 300000 * 5

  let callStart = new Date().getTime();

  logger.info(
    `Video chat connection - userId: ${userId}, roomId: ${JSON.stringify(
      roomId
    )}, type: ${typeof roomId}`
  );

  if (!userId || typeof userId !== "string") {
    socket.emit("error", { message: "Invalid or missing userId" });
    socket.disconnect();
    return;
  }

  if (!roomId || typeof roomId !== "string") {
    logger.warn(
      `Invalid roomId after processing - value: ${JSON.stringify(
        roomId
      )}, type: ${typeof roomId}`
    );
    socket.emit("error", { message: "Invalid or missing roomId" });
    socket.disconnect();
    return;
  }

  // Verify user is part of this room
  const isAuthorized = await RoomManager.isUserInRoom(userId, roomId);
  if (!isAuthorized) {
    socket.emit("error", { message: "Room not found or user not authorized" });
    socket.disconnect();
    return;
  }

  logger.info(`User ${userId} joined video chat room ${roomId}`);

  // Join the room
  socket.join(roomId);

  // Get all sockets currently in the room (before this user joined)
  const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
  const otherUsers = socketsInRoom
    .map((s) => s.handshake.auth.userId as string)
    .filter((id) => id !== userId);

  // Tell the new user about existing users
  if (otherUsers.length > 0) {
    logger.info(
      `Notifying ${userId} about existing users: ${otherUsers.join(", ")}`
    );
    for (const otherUserId of otherUsers) {
      socket.emit("user-ready", { userId: otherUserId });
    }
  }

  // Notify other users that this user joined and is ready
  socket.to(roomId).emit("user-ready", { userId });

  // Handle WebRTC signaling events
  socket.on("offer", async (data: WebRTCOffer) => {
    logger.info(`Offer received from ${userId} in room ${roomId}`);
    const roomData = await RoomManager.getRoomData(roomId);
    socket.to(roomId).emit("offer", {
      offer: data.offer,
      from: userId,
      callType: roomData?.matchType,
    });
  });

  socket.on("answer", async (data: WebRTCAnswer) => {
    logger.info(`Answer received from ${userId} in room ${roomId}`);
    const roomData = await RoomManager.getRoomData(roomId);
    timeoutId = setTimeout(() => {
      io.of("/video-chat").to(roomId).emit("timeout");
      console.log("Server Timeout Event");
    }, timeoutMs);
    socket.to(roomId).emit("answer", {
      answer: data.answer,
      from: userId,
      callType: roomData?.matchType,
    });
  });

  socket.on("ice-candidate", (data: WebRTCIceCandidate) => {
    logger.info(`ICE candidate received from ${userId} in room ${roomId}`);
    socket
      .to(roomId)
      .emit("ice-candidate", { candidate: data.candidate, from: userId });
  });

  socket.on("disconnect", async () => {
    logger.info(`User ${userId} disconnected from video chat room ${roomId}`);

    // Notify the other user
    socket.to(roomId).emit("user-left", { userId });

    // Check if room is empty and clean up
    const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
    if (socketsInRoom.length === 0) {
      logger.info(`Room ${roomId} is empty, cleaning up`);
      await RoomManager.deleteRoom(roomId);
    }
  });

  socket.on("soft-leave", () => {
    clearTimeout(timeoutId);
    io.of("/video-chat").to(roomId).emit("timeout");
    console.log("Prematurely Ending Call");
  });

  socket.on("leave-room", async () => {
    logger.info(`User ${userId} left video chat room ${roomId}`);

    // Notify the other user
    socket.to(roomId).emit("user-left", { userId });

    // Remove user from room
    socket.leave(roomId);

    // Check if room is empty and clean up
    const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
    if (socketsInRoom.length === 0) {
      logger.info(`Room ${roomId} is empty, cleaning up`);
      await RoomManager.deleteRoom(roomId);
    }

    socket.disconnect();
  });

  socket.on("user-call-again", async () => {
    try {
      logger.info(`User ${userId} clicked call again in room ${roomId}`);
      console.log(`User ${userId} clicked call again in room ${roomId}`);

      // Set the call-again state for this user
      await RoomManager.setCallAgainState(roomId, userId, true);

      // Check the call-again state for both users
      const callAgainState = await RoomManager.getCallAgainState(roomId);
      const matchState = await RoomManager.getMatchState(roomId);
      const roomData = await RoomManager.getRoomData(roomId);

      if (!roomData) {
        logger.error(`Room ${roomId} not found during call again`);
        console.log(`Room ${roomId} not found during call again`);
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const { user1, user2 } = roomData;

      logger.info(`Call again state for room ${roomId}:`, callAgainState);
      console.log(`Call again state for room ${roomId}:`, callAgainState);

      if (
        (callAgainState[user1] && callAgainState[user2]) ||
        (matchState[user1] && callAgainState[user2]) ||
        (matchState[user2] && callAgainState[user1])
      ) {
        // Both users clicked "call again"
        logger.info(`Both users in room ${roomId} want to call again`);

        // Notify both users
        io.of("/video-chat").to(roomId).emit("call-again");

        // Reset the call-again state
        await RoomManager.resetCallAgainState(roomId);

        // Set a timeout for reconnecting feeds
        timeoutId = setTimeout(() => {
          io.of("/video-chat").to(roomId).emit("timeout");
        }, callAgainTimeout);
      } else {
        // Notify the other user to click "call again"
        logger.info(
          `Waiting for both users to click call again in room ${roomId}`
        );
        console.log(
          `Waiting for both users to click call again in room ${roomId}`
        );
        socket.to(roomId).emit("user-call-again", { userId });
      }
    } catch (error) {
      logger.error("Error handling user-call-again event:", error);
      socket.emit("error", {
        message: "An error occurred while processing call again",
      });
    }
  });

  socket.on("background-changed", ({ background }: { background: string }) => {
    logger.info(`User ${userId} changed the background to ${background}`);
    io.of("/video-chat").to(roomId).emit("background-changed", { background });
  });

  socket.on("game-request", ({ gameId }: { gameId: string }) => {
    logger.info(`User ${userId} sent ${gameId} request`);
    io.of("/video-chat")
      .to(roomId)
      .emit("game-request", { gameId, outgoingUserId: userId });
  });

  socket.on("cancel-game-request", () => {
    io.of("/video-chat").to(roomId).emit("cancel-game-request");
  });

  socket.on("accept-game-request", async ({ gameId }: { gameId: string }) => {
    const roomData = await RoomManager.getRoomData(roomId);
    if (!roomData) {
      logger.error(`Room data missing when starting game ${gameId} in ${roomId}`);
      socket.emit("error", { message: "Unable to start game - room not found" });
      return;
    }

    const opponentId = roomData.user1 === userId ? roomData.user2 : roomData.user1;
    if (!opponentId) {
      logger.error(
        `Could not determine opponent for user ${userId} when starting game ${gameId} in room ${roomId}`
      );
      socket.emit("error", { message: "Unable to start game - opponent missing" });
      return;
    }

    const randomNum = Math.random();
    const firstTurn = randomNum < 0.5 ? userId : opponentId;

    if (gameId == "headsup") {
      const itemIndex = Math.floor(Math.random() * headsupItems.length);

      const expiryTime = Date.now() + 60 * 1000;

      const turnTimeout = setTimeout(() => {
        advanceHeadsupTurn(roomId, null);
      }, 60 * 1000);

      gameTurnTimeouts.set(roomId, turnTimeout);

      const gameState: HeadsupGameState = {
        turnNumber: 1,
        currentTurn: firstTurn,
        turnOverTime: expiryTime,
        numCorrect: 0,
        item: headsupItems[itemIndex],
        previousItemIndexes: [itemIndex],
      };

      await redis.set(`game:${roomId}`, JSON.stringify(gameState), {
        EX: 3600,
      });

      io.of("/video-chat")
        .to(roomId)
        .emit("game-started", { gameState, gameId });
    } else if (gameId == "tictactoe") {
      const randomNum = Math.random();
      const playerX = randomNum < 0.5 ? userId : opponentId;
      const playerO = playerX === userId ? opponentId : userId;

      const gameState: TicTacToeGameState = {
        board: Array(9).fill(null),
        currentTurn: playerX,
        playerX,
        playerO,
        winner: null,
        turnNumber: 1,
      };

      logger.info(`Tic-tac-toe game started: room ${roomId}, playerX: ${playerX}, playerO: ${playerO}, first turn: ${playerX}`);

      await redis.set(`game:${roomId}`, JSON.stringify(gameState), {
        EX: 3600,
      });

      io.of("/video-chat")
        .to(roomId)
        .emit("game-started", { gameState, gameId });
    }
  });

  socket.on("game-ended", async () => {
    const timeout = gameTurnTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      gameTurnTimeouts.delete(roomId);
    }

    await redis.del(`game:${roomId}`);

    io.of("/video-chat").to(roomId).emit("game-ended");
  });

  socket.on("headsup-answer", ({ answer }: { answer: string }) => {
    advanceHeadsupTurn(roomId, answer);
  });

  socket.on("tictactoe-move", async ({ cellIndex }: { cellIndex: number }) => {
    logger.info(`User ${userId} attempting move at cell ${cellIndex} in room ${roomId}`);
    processTicTacToeMove(roomId, cellIndex, userId);
  });

  socket.on("user-match", async () => {
    try {
      logger.info(`User ${userId} clicked match in room ${roomId}`);
      console.log(`User ${userId} clicked match in room ${roomId}`);

      // Set the call-again state for this user
      await RoomManager.setMatchState(roomId, userId, true);

      // Check the call-again state for both users
      const matchState = await RoomManager.getMatchState(roomId);
      const callAgainState = await RoomManager.getCallAgainState(roomId);
      const roomData = await RoomManager.getRoomData(roomId);

      if (!roomData) {
        logger.error(`Room ${roomId} not found during call again`);
        console.log(`Room ${roomId} not found during call again`);
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const { user1, user2 } = roomData;

      logger.info(`Match state for room ${roomId}:`, matchState);
      console.log(`Match state for room ${roomId}:`, matchState);

      if (matchState[user1] && matchState[user2]) {
        // Both users clicked "match"
        clearTimeout(timeoutId); // No timeouts after both users match
        logger.info(`Both users in room ${roomId} clicked match`);

        // Notify both users with matchType
        io.of("/video-chat")
          .to(roomId)
          .emit("match", { matchType: roomData.matchType });
      } else if (
        (matchState[user1] && callAgainState[user2]) ||
        (matchState[user2] && callAgainState[user1])
      ) {
        console.log("One match one call again, sending call again.");
        // Notify both users
        io.of("/video-chat").to(roomId).emit("call-again");

        // Reset the call-again state
        await RoomManager.resetCallAgainState(roomId);

        // Set a timeout for reconnecting feeds
        timeoutId = setTimeout(() => {
          io.of("/video-chat").to(roomId).emit("timeout");
        }, callAgainTimeout);
      } else {
        // Notify the other user to click "call again"
        logger.info(`Waiting for both users to match in room ${roomId}`);
        console.log(`Waiting for both users to match in room ${roomId}`);
        // socket.to(roomId).emit("user-match", { userId });
      }
    } catch (error) {
      logger.error("Error handling user-match event:", error);
      socket.emit("error", {
        message: "An error occurred while processing match",
      });
    }
  });

  socket.on("user-uncall", async () => {
    try {
      logger.info(`User ${userId} clicked uncall in room ${roomId}`);
      console.log(`User ${userId} clicked uncall in room ${roomId}`);

      // Set the call-again state for this user
      await RoomManager.setCallAgainState(roomId, userId, false);
    } catch (error) {
      logger.error("Error handling user-uncall event:", error);
      socket.emit("error", {
        message: "An error occurred while processing call again",
      });
    }
  });

  socket.on("user-unmatch", async () => {
    try {
      logger.info(`User ${userId} clicked unmatch in room ${roomId}`);
      console.log(`User ${userId} clicked unmatch in room ${roomId}`);

      // Set the call-again state for this user
      await RoomManager.setMatchState(roomId, userId, false);
    } catch (error) {
      logger.error("Error handling unmatch event:", error);
      socket.emit("error", {
        message: "An error occurred while processing unmatch",
      });
    }
  });

  socket.on("delete-match", async () => {
    try {
      logger.info(`User ${userId} clicked delete-match in room ${roomId}`);
      console.log(`User ${userId} clicked delete-match in room ${roomId}`);

      // Set the call-again state for this user
      await RoomManager.setMatchState(roomId, userId, false);

      // Also remove any persistent matches between these two users in the DB
      try {
        const roomData = await RoomManager.getRoomData(roomId);
        if (roomData) {
          const otherUser =
            roomData.user1 === userId ? roomData.user2 : roomData.user1;
          if (otherUser) {
            await db
              .delete(matches)
              .where(
                sql`${matches.first} = ${userId} AND ${matches.second} = ${otherUser} OR ${matches.first} = ${otherUser} AND ${matches.second} = ${userId}`
              );
            logger.info(`Deleted matches between ${userId} and ${otherUser}`);
          }
        }
        io.of("/video-chat").to(roomId).emit("match-deleted");
      } catch (err) {
        logger.error("Error deleting matches on unmatch:", err);
        console.log("ERROR WITH UNMATCHING");
      }
    } catch (error) {
      logger.error("Error handling unmatch event:", error);
      socket.emit("error", {
        message: "An error occurred while processing unmatch",
      });
    }
  });
}

async function advanceHeadsupTurn(
  roomId: string,
  answer: string | null
) {
  const gameStateStr = await redis.get(`game:${roomId}`);
  if (!gameStateStr) {
    logger.warn(`Game state not found for room ${roomId}, cannot advance turn`);
    return;
  }
  const oldGameState = JSON.parse(gameStateStr) as HeadsupGameState;

  // Get room data to determine both users
  const roomData = await RoomManager.getRoomData(roomId);
  if (!roomData) {
    logger.warn(`Room data not found for room ${roomId}`);
    return;
  }

  const { user1, user2 } = roomData;

  const existingTimeout = gameTurnTimeouts.get(roomId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  if (oldGameState.turnNumber >= 10) {
    io.of("/video-chat").to(roomId).emit("game-ended");
    await redis.del(`game:${roomId}`);
    gameTurnTimeouts.delete(roomId);
    return;
  }

  const expiresAt = Date.now() + 60 * 1000;

  const turnTimeout = setTimeout(() => {
    advanceHeadsupTurn(roomId, null);
  }, 60 * 1000);

  gameTurnTimeouts.set(roomId, turnTimeout);

  let index = Math.floor(Math.random() * headsupItems.length);
  let attempts = 0;
  while (oldGameState.previousItemIndexes.includes(index) && attempts < 1000) {
    index = Math.floor(Math.random() * headsupItems.length);
    attempts++;
  }

  // Swap turn to the other user
  const nextTurn = oldGameState.currentTurn === user1 ? user2 : user1;

  const newGameState: HeadsupGameState = {
    currentTurn: nextTurn,
    turnNumber: oldGameState.turnNumber + 1,
    turnOverTime: expiresAt,
    numCorrect:
      answer?.toLowerCase().trim() === oldGameState.item.toLowerCase().trim()
        ? oldGameState.numCorrect + 1
        : oldGameState.numCorrect,
    item: headsupItems[index],
    previousItemIndexes: [...oldGameState.previousItemIndexes, index],
  };

  await redis.set(`game:${roomId}`, JSON.stringify(newGameState), { EX: 3600 });

  io.of("/video-chat")
    .to(roomId)
    .emit("headsup-turn-advanced", {
      gameState: newGameState,
      correct:
        answer?.toLowerCase().trim() === oldGameState.item.toLowerCase().trim(),
      correctAnswer: oldGameState.item,
    });
}

async function processTicTacToeMove(
  roomId: string,
  cellIndex: number,
  userId: string
) {
  const gameStateStr = await redis.get(`game:${roomId}`);
  if (!gameStateStr) {
    logger.warn(`Game state not found for room ${roomId}, cannot process move`);
    return;
  }

  const gameState = JSON.parse(gameStateStr) as TicTacToeGameState;

  // Validate it's the player's turn
  if (gameState.currentTurn !== userId) {
    logger.warn(`User ${userId} tried to move but it's not their turn`);
    return;
  }

  // Validate cell is empty
  if (gameState.board[cellIndex] !== null) {
    logger.warn(`User ${userId} tried to move to occupied cell ${cellIndex}`);
    return;
  }

  // Validate cell index is valid
  if (cellIndex < 0 || cellIndex > 8) {
    logger.warn(`Invalid cell index ${cellIndex}`);
    return;
  }

  // Make the move
  const symbol = userId === gameState.playerX ? 'X' : 'O';
  const newBoard = [...gameState.board];
  newBoard[cellIndex] = symbol;

  // Check for winner or tie
  const winner = checkWinner(newBoard);
  const isTie = checkTie(newBoard);

  // Determine next turn (only switch if game continues)
  const nextTurn = winner || isTie
    ? gameState.currentTurn
    : (userId === gameState.playerX ? gameState.playerO : gameState.playerX);

  const newGameState: TicTacToeGameState = {
    ...gameState,
    board: newBoard,
    currentTurn: nextTurn,
    winner: winner === 'X' ? gameState.playerX : winner === 'O' ? gameState.playerO : (isTie ? 'tie' : null),
    turnNumber: gameState.turnNumber + 1,
  };

  logger.info(`Tic-tac-toe move processed: room ${roomId}, user ${userId} (${symbol}), cell ${cellIndex}, next turn: ${nextTurn}, winner: ${newGameState.winner}`);

  await redis.set(`game:${roomId}`, JSON.stringify(newGameState), { EX: 3600 });

  io.of("/video-chat")
    .to(roomId)
    .emit("tictactoe-move-made", {
      gameState: newGameState,
      cellIndex,
    });

  // Auto-end game if there's a winner or tie
  if (winner || isTie) {
    setTimeout(async () => {
      io.of("/video-chat").to(roomId).emit("game-ended");
      await redis.del(`game:${roomId}`);
    }, 3000); // 3 second delay to show the final state
  }
}
