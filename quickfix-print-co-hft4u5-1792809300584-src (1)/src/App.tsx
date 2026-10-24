import { useEffect } from 'react';
import { AuthProvider } from './lib/auth';
import { useRoute, type Route } from './lib/router';
import { Footer, Header } from './components/Layout';
import Home from './pages/Home';
import { About, NotFound, Privacy, Services } from './pages/Info';
import { ProductDetail, Products } from './pages/Products';
import { Contact } from './pages/Contact';
import { ShowcasePage } from './pages/Showcase';
import AdminApp from './admin/AdminApp';
import { useReveal } from './lib/reveal';

function Page({ route }: { route: Route }) {
  const { path } = route;
  if (path === '/') return <Home />;
  if (path === '/about') return <About />;
  if (path === '/products') return <Products route={route} />;
  if (path.startsWith('/products/')) {
    return (
      <ProductDetail
        slug={decodeURIComponent(path.slice('/products/'.length))}
      />
    );
  }
  if (path === '/services') return <Services />;
  if (path === '/works') return <ShowcasePage kind="work" />;
  if (path === '/clients') return <ShowcasePage kind="client" />;
  if (path === '/contact') return <Contact route={route} />;
  if (path === '/privacy') return <Privacy />;
  return <NotFound />;
}

function PublicSite({ route }: { route: Route }) {
  useReveal(route.path);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={e => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to main content
      </a>
      <Header route={route} />
      <main id="main" tabIndex={-1}>
        <div className="page-enter" key={route.path}>
          <Page route={route} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const isAdmin = route.path === '/admin' || route.path.startsWith('/admin/');

  return (
    <AuthProvider>
      {isAdmin ? <AdminApp route={route} /> : <PublicSite route={route} />}
    </AuthProvider>
  );
}
