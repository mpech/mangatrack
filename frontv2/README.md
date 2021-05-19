start:

cd src; npx vite

Architecture:

| store
|   actions
|   write
| containers -- use store, couple components
| components -- simple as rendering from props: up callback as events
| views -- entry point for each page

Running the tests
npm tests