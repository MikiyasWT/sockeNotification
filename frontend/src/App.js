import React, { useState, useEffect } from "react";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const ENDPOINT = "http://localhost:5000";
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {
    // Function to handle initial blogs and new blogs
    const handleInitialBlogs = (initialBlogs) => {
      setBlogs(initialBlogs);
    };

    const handleNewBlog = (newBlog) => {
      setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
      notify(`New blog created: ${newBlog.title}`);
    };

    const handleDeletedBlog = (deletedBlogId) => {
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.id !== deletedBlogId)
      );
    };

    socket.on("initialBlogs", handleInitialBlogs);
    socket.on("newBlog", handleNewBlog);
    socket.on("deletedBlog", handleDeletedBlog);

    return () => {
      socket.off("initialBlogs", handleInitialBlogs);
      socket.off("newBlog", handleNewBlog);
      socket.off("deletedBlog", handleDeletedBlog);
    };
  }, []);

  const notify = (message) => {
    toast.success(message, {
      className: "toast-container",
      bodyClassName: "toast-body",
      position: "top-center", // Use string instead of constant
      autoClose: 5000, // 5 seconds
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/blogs", { title, content })
      .then((response) => {
        setBlogs([...blogs, response.data]);
        setTitle("");
        setContent("");
      })
      .catch((error) => {
        console.error("Error adding blog:", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/blogs/${id}`)
      .then(() => {
        setBlogs(blogs.filter((blog) => blog.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting blog:", error);
      });
  };

  return (
    <div className="container w-full bg-white mx-[10px]">
      <div className="w-full md:w-full lg:w-1/2 xl:w-1/2 mx-auto py-4 bg-blue-400 px-1">
        <h1 className="text-3xl font-bold mb-4">Blogs</h1>
        <div className=" max-w-full bg-white flex flex-row py-1 align-center">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="w-full border-red-400 flex flex-row ">
              <div className="">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border p-2 mr-2 flex-grow "
                  placeholder="Title"
                />
              </div>
              <div className="">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border p-2 mr-2 flex-grow"
                  placeholder="Content"
                ></input>
              </div>
              <div className="">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Blog
                </button>
              </div>
            </div>
          </form>
        </div>

        <ul>
          {blogs.map((blog) => (
            <li key={blog.id} className="mb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{blog.title}</h2>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <p>{blog.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
