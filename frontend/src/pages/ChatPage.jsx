"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useChatStore } from "../store/chatStore.js"
import { useAuthStore } from "../store/authStore.js"
import { chatAPI, usersAPI, authAPI } from "../lib/api.js"
import ChatSidebar from "../components/chat/ChatSidebar.jsx"
import MessageList from "../components/chat/MessageList.jsx"
import MessageInput from "../components/chat/MessageInput.jsx"
import { Button } from "../components/ui/button"
import { SearchIcon, UserPlusIcon, VideoIcon, LogOutIcon, HomeIcon, SettingsIcon } from "lucide-react"
import { Input } from "../components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { toast } from "sonner"
import VideoCall from "../components/video/VideoCall.jsx"

export default function ChatPage() {
  const { conversationId: paramConversationId } = useParams()
  const navigate = useNavigate()
  const { conversations, messages, selectedConversationId, setConversations, setMessages, setSelectedConversation } =
    useChatStore()
  const { user, logout } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showNewChatSheet, setShowNewChatSheet] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false) // State for mobile sidebar

  // Effect to select conversation from URL param
  useEffect(() => {
    if (paramConversationId && paramConversationId !== selectedConversationId) {
      setSelectedConversation(paramConversationId)
      fetchMessages(paramConversationId)
    }
  }, [paramConversationId, selectedConversationId, setSelectedConversation])

  const fetchConversations = useCallback(async () => {
    try {
      const response = await chatAPI.getConversations()
      setConversations(response.data)
      // If no conversation is selected and there are conversations, select the first one
      if (!selectedConversationId && response.data.length > 0) {
        setSelectedConversation(response.data[0]._id)
        navigate(`/chat/${response.data[0]._id}`)
      } else if (paramConversationId && !selectedConversationId) {
        // If a conversation ID is in the URL but not yet selected
        setSelectedConversation(paramConversationId)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast.error("Failed to load conversations.")
    }
  }, [setConversations, selectedConversationId, paramConversationId, setSelectedConversation, navigate])

  const fetchMessages = useCallback(
    async (id) => {
      if (!id) {
        setMessages([])
        return
      }
      try {
        const response = await chatAPI.getMessages(id)
        setMessages(response.data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast.error("Failed to load messages.")
        setMessages([])
      }
    },
    [setMessages],
  )

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    }
  }, [selectedConversationId, fetchMessages])

  const handleSelectConversation = (id) => {
    setSelectedConversation(id)
    navigate(`/chat/${id}`)
    setShowSidebar(false) // Close sidebar on selection for mobile
  }

  const handleSearchUsers = useCallback(async () => {
    if (searchTerm.trim().length > 2) {
      try {
        const response = await usersAPI.searchUsers(searchTerm.trim())
        setSearchResults(response.data.filter((u) => u._id !== user.id)) // Exclude current user
      } catch (error) {
        console.error("Error searching users:", error)
        toast.error("Failed to search users.")
        setSearchResults([])
      }
    } else {
      setSearchResults([])
    }
  }, [searchTerm, user])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearchUsers()
    }, 500) // Debounce search

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, handleSearchUsers])

  const handleCreateDirectConversation = async (participantId) => {
    try {
      const response = await chatAPI.createConversation({
        participantIds: [participantId],
        type: "direct",
      })
      setSelectedConversation(response.data._id)
      navigate(`/chat/${response.data._id}`)
      setShowNewChatSheet(false)
      toast.success("Direct chat created!")
      fetchConversations() // Re-fetch to update sidebar
    } catch (error) {
      console.error("Error creating direct conversation:", error)
      toast.error(error.response?.data?.message || "Failed to create direct chat.")
    }
  }

  const currentConversation = useMemo(() => {
    return conversations.find((conv) => conv._id === selectedConversationId)
  }, [conversations, selectedConversationId])

  const getConversationHeaderName = () => {
    if (!currentConversation) return "Select a chat"
    if (currentConversation.type === "group") {
      return currentConversation.name || "Group Chat"
    }
    // Direct chat: display other participant's name
    const otherParticipant = currentConversation.participants.find((p) => p._id !== user.id)
    return otherParticipant?.username || "Direct Message"
  }

  const handleLogout = async () => {
    try {
      await authAPI.signOut()
      logout()
      toast.info("Logged out successfully.")
      navigate("/auth/signin")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out.")
    }
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-80 flex-col border-r bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowNewChatSheet(true)}>
            <UserPlusIcon className="h-5 w-5" />
            <span className="sr-only">New chat</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        <div className="p-4 border-t flex flex-col gap-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
            <HomeIcon className="mr-2 h-4 w-4" /> Home
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
          <div className="md:hidden">
            <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowNewChatSheet(true)}>
                      <UserPlusIcon className="h-5 w-5" />
                      <span className="sr-only">New chat</span>
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ChatSidebar
                      conversations={conversations}
                      selectedConversationId={selectedConversationId}
                      onSelectConversation={handleSelectConversation}
                    />
                  </div>
                  <div className="p-4 border-t flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/")
                        setShowSidebar(false)
                      }}
                    >
                      <HomeIcon className="mr-2 h-4 w-4" /> Home
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/settings")
                        setShowSidebar(false)
                      }}
                    >
                      <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <h1 className="text-lg font-semibold">{getConversationHeaderName()}</h1>
          <Button variant="ghost" size="icon" disabled={!selectedConversationId}>
            <VideoIcon className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </Button>
        </div>

        {/* Message Area */}
        {selectedConversationId ? (
          <>
            <MessageList />
            {currentConversation && <VideoCall conversationId={currentConversation._id} />}
            <div className="p-4 border-t bg-white dark:bg-gray-900">
              <MessageInput conversationId={selectedConversationId} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation or start a new one.
          </div>
        )}
      </div>

      {/* New Chat Sheet */}
      <Sheet open={showNewChatSheet} onOpenChange={setShowNewChatSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <div className="flex flex-col h-full p-4">
            <h2 className="text-xl font-bold mb-4">Start a new chat</h2>
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="grid gap-2">
                  {searchResults.map((user) => (
                    <Button
                      key={user._id}
                      variant="ghost"
                      className="w-full justify-start py-2 px-3 flex items-center gap-3"
                      onClick={() => handleCreateDirectConversation(user._id)}
                    >
                      <img
                        src={user.avatar_url || "/placeholder-user.jpg"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      {user.username}
                      {user.is_online && <span className="h-2 w-2 rounded-full bg-green-500 ml-auto" title="Online" />}
                    </Button>
                  ))}
                </div>
              ) : (
                searchTerm.length > 2 && <p className="text-center text-gray-500">No users found.</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
