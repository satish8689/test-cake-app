import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  return (
    <>
    <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}