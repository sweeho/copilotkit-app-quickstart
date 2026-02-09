# BUGS 3rd interation

1. error 

## Error Type
Recoverable Error

## Error Message
Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<SegmentViewNode>} forbidden={undefined} ...>
      <RedirectBoundary>
        <RedirectErrorBoundary router={{...}}>
          <InnerLayoutRouter url="/" tree={[...]} params={{}} cacheNode={{rsc:<Fragment>, ...}} segmentPath={[...]} ...>
            <SegmentViewNode type="page" pagePath="page.tsx">
              <SegmentTrieNode>
              <ClientPageRoot Component={function Page} serverProvidedParams={{...}}>
                <Page params={Promise} searchParams={Promise}>
                  <LoginScreen onLogin={function Page.useCallback[handleLogin]}>
                    <Fade in={true} timeout={600}>
                      <Transition appear={true} in={true} nodeRef={{current:null}} onEnter={function} ...>
                        <Box sx={{...}} style={{opacity:0, ...}} ref={function useForkRef.useMemo}>
                          <Styled(div) as="div" ref={function useForkRef.useMemo} className="MuiBox-root" theme={{...}} ...>
                            <Insertion>
+                           <div
+                             className="MuiBox-root css-1u36dz0"
+                             style={{opacity:0,visibility:undefined}}
+                             ref={function useForkRef.useMemo}
+                           >
-                           <style data-emotion="css 1u36dz0" data-s="">
            ...
          ...



    at div (unknown:0:0)
    at LoginScreen (app/components/Auth/LoginScreen.tsx:45:7)

## Code Frame
  43 |   return (
  44 |     <Fade in timeout={600}>
> 45 |       <Box
     |       ^
  46 |         sx={{
  47 |           minHeight: '100vh',
  48 |           display: 'flex',

Next.js version: 16.1.6 (Turbopack)


2. There must be a logout button to logout. then show the login screen once logout.

3. Selecting any session will open exactly the same session, which is not expected. the session should open the session in the ADK Agent session with the corresponding id.

4. The thought sider bar still not showing any thought process of the agent.

5. enable debug log for ADK to show details logs including the thought process.

6. the "New Session" button next to the "Thought" button does not work. It should open a new Session and link to the new session in the ADK.

