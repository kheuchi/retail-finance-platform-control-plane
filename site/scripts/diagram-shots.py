"""Retake the diagram screenshots used in the Markdown docs (docs/architecture/img/), from the built site.
Headless Edge over the DevTools protocol, expert mode, light theme, scale 1.5. Windows; needs `pip install websocket-client`.
Usage: build the site (npm run build), serve site/dist under /retail-finance-platform-control-plane/ on 127.0.0.1:8765
(copy dist to <tmp>/retail-finance-platform-control-plane, run `python -m http.server 8765` in <tmp>),
then: python site/scripts/diagram-shots.py <empty profile dir>"""
import base64, json, subprocess, time, urllib.request, pathlib, sys
import websocket

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
BASE = "http://127.0.0.1:8765/retail-finance-platform-control-plane/architecture/architecture.html"
OUT = pathlib.Path(__file__).resolve().parents[2] / "docs" / "architecture" / "img"
OUT.mkdir(exist_ok=True)
SHOTS = [("built-hld", "built-hld"), ("built-lld-0", "built-lld-data-platform"), ("built-lld-1", "built-lld-ml"),
         ("built-lld-2", "built-lld-agent"), ("built-lld-3", "built-lld-identity-cicd"),
         ("target-hld", "target-hld"), ("target-lld-4", "target-lld-agent")]

prof = pathlib.Path(sys.argv[1])
p = subprocess.Popen([EDGE, "--headless=new", "--remote-debugging-port=9333", f"--user-data-dir={prof}", "--hide-scrollbars", "about:blank"])
try:
    for _ in range(50):
        try:
            tabs = json.load(urllib.request.urlopen("http://127.0.0.1:9333/json")); break
        except Exception:
            time.sleep(0.2)
    ws = websocket.create_connection(next(t for t in tabs if t["type"] == "page")["webSocketDebuggerUrl"], timeout=30)
    n = [0]
    def cdp(method, **params):
        n[0] += 1; ws.send(json.dumps({"id": n[0], "method": method, "params": params}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == n[0]:
                if "error" in m: raise RuntimeError(m["error"])
                return m.get("result", {})
    cdp("Emulation.setDeviceMetricsOverride", width=1800, height=1200, deviceScaleFactor=1.5, mobile=False)
    cdp("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "light"}])
    cdp("Page.navigate", url=BASE); time.sleep(1.5)
    cdp("Runtime.evaluate", expression="localStorage.setItem('rfp-mode','expert')")
    for h, name in SHOTS:
        cdp("Page.navigate", url=f"{BASE}#{h}"); time.sleep(0.3)
        cdp("Page.reload"); time.sleep(2.0)
        r = cdp("Runtime.evaluate", returnByValue=True, expression="""(() => { document.querySelector('.bar').style.display='none'; scrollTo(0,0); const s = document.querySelector('main .scroll');
            const r = s.getBoundingClientRect(); return {x: r.left + scrollX, y: r.top + scrollY, w: s.scrollWidth, h: r.height,
            paths: document.querySelectorAll('main svg.wires path[data-k]').length}; })()""")["result"]["value"]
        img = cdp("Page.captureScreenshot", format="png", captureBeyondViewport=True, clip={"x": r["x"], "y": r["y"], "width": r["w"], "height": r["h"], "scale": 1})
        (OUT / f"{name}.png").write_bytes(base64.b64decode(img["data"]))
        print(name, r)
finally:
    p.terminate()
