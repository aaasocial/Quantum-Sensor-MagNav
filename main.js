import * as e from "magnav.api";
//#region \0rolldown/runtime.js
var t = Object.create, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = Object.getOwnPropertyNames, a = Object.getPrototypeOf, o = Object.prototype.hasOwnProperty, s = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), c = (e, t) => {
	let r = {};
	for (var i in e) n(r, i, {
		get: e[i],
		enumerable: !0
	});
	return t || n(r, Symbol.toStringTag, { value: "Module" }), r;
}, l = (e, t, a, s) => {
	if (t && typeof t == "object" || typeof t == "function") for (var c = i(t), l = 0, u = c.length, d; l < u; l++) d = c[l], !o.call(e, d) && d !== a && n(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(s = r(t, d)) || s.enumerable
	});
	return e;
}, u = (e, r, i) => (i = e == null ? {} : t(a(e)), l(r || !e || !e.__esModule || !o.call(e, "default") ? n(i, "default", {
	value: e,
	enumerable: !0
}) : i, e)), d = /* @__PURE__ */ s(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, O());
			else {
				var t = n(l);
				t !== null && j(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function E() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function D() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && E());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && j(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? O() : S = !1;
			}
		}
	}
	var O;
	if (typeof y == "function") O = function() {
		y(D);
	};
	else if (typeof MessageChannel < "u") {
		var k = new MessageChannel(), A = k.port2;
		k.port1.onmessage = D, O = function() {
			A.postMessage(null);
		};
	} else O = function() {
		_(D, 0);
	};
	function j(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, j(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
	}, e.unstable_shouldYield = E, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), f = /* @__PURE__ */ s(((e, t) => {
	t.exports = d();
})), p = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, E = Object.prototype.hasOwnProperty;
	function D(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function O(e, t) {
		return D(e.type, t, e.props);
	}
	function k(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function A(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var j = /\/+/g;
	function M(e, t) {
		return typeof e == "object" && e && e.key != null ? A("" + e.key) : t.toString(36);
	}
	function N(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ee(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, ee(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + M(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(j, "$&/") + "/"), ee(o, r, i, "", function(e) {
			return e;
		})) : o != null && (k(o) && (o = O(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(j, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + M(a, u), c += ee(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + M(a, u++), c += ee(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ee(N(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function te(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ee(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ne(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var re = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function ie(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, re);
		} catch (e) {
			re(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function ae(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else ie(ae.bind(null, e));
	}
	var oe = {
		map: te,
		forEach: function(e, t, n) {
			te(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return te(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return te(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!k(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = oe, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = ae, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !E.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return D(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) E.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return D(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = k, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ne
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = ie, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.0";
})), m = /* @__PURE__ */ s(((e, t) => {
	t.exports = p();
})), h = /* @__PURE__ */ s(((e) => {
	var t = m();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function u(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = u(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = u(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.0";
})), g = /* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = h();
})), _ = /* @__PURE__ */ s(((e) => {
	var t = f(), n = m(), r = g();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function u(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function d(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = d(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function p(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && p(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function h(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = h(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var x = null, S = null;
	function C(e, t, n) {
		return e === n || e === t && (x = e, !0);
	}
	function w(e, t, n) {
		return e === n ? (S = e, !1) : e === t && (S !== null && (x = e), !0);
	}
	function T(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function E(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var D = Object.assign, O = Symbol.for("react.element"), k = Symbol.for("react.transitional.element"), A = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), ee = Symbol.for("react.consumer"), te = Symbol.for("react.context"), ne = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), ie = Symbol.for("react.suspense_list"), ae = Symbol.for("react.memo"), oe = Symbol.for("react.lazy"), P = Symbol.for("react.activity"), se = Symbol.for("react.legacy_hidden"), ce = Symbol.for("react.memo_cache_sentinel"), le = Symbol.for("react.view_transition"), ue = Symbol.for("react.recoverable"), de = Symbol.iterator;
	function fe(e) {
		return typeof e != "object" || !e ? null : (e = de && e[de] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var pe = Symbol.for("react.client.reference");
	function me(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === pe ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case j: return "Fragment";
			case N: return "Profiler";
			case M: return "StrictMode";
			case re: return "Suspense";
			case ie: return "SuspenseList";
			case P: return "Activity";
			case le: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case A: return "Portal";
			case te: return e.displayName || "Context";
			case ee: return (e._context.displayName || "Context") + ".Consumer";
			case ne:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ae: return t = e.displayName || null, t === null ? me(e.type) || "Memo" : t;
			case oe:
				t = e._payload, e = e._init;
				try {
					return me(e(t));
				} catch {}
		}
		return null;
	}
	var he = Array.isArray, F = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, I = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ge = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, _e = [], ve = -1;
	function L(e) {
		return { current: e };
	}
	function ye(e) {
		0 > ve || (e.current = _e[ve], _e[ve] = null, ve--);
	}
	function be(e, t) {
		ve++, _e[ve] = e.current, e.current = t;
	}
	var xe = L(null), Se = L(null), Ce = L(null), we = L(null);
	function Te(e, t) {
		switch (be(Ce, t), be(Se, e), be(xe, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? dp(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = dp(t), e = fp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		ye(xe), be(xe, e);
	}
	function Ee() {
		ye(xe), ye(Se), ye(Ce);
	}
	function De(e) {
		var t = e.memoizedState;
		t !== null && (ch._currentValue = t.memoizedState, be(we, e)), t = xe.current;
		var n = fp(t, e.type);
		t !== n && (be(Se, e), be(xe, n));
	}
	function Oe(e) {
		Se.current === e && (ye(xe), ye(Se)), we.current === e && (ye(we), ch._currentValue = ge);
	}
	var ke, Ae;
	function je(e) {
		if (ke === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ke = t && t[1] || "", Ae = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ke + e + Ae;
	}
	var R = !1;
	function Me(e, t) {
		if (!e || R) return "";
		R = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			R = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? je(n) : "";
	}
	function Ne(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return je(e.type);
			case 16: return je("Lazy");
			case 13: return e.child !== t && t !== null ? je("Suspense Fallback") : je("Suspense");
			case 19: return je("SuspenseList");
			case 0:
			case 15: return Me(e.type, !1);
			case 11: return Me(e.type.render, !1);
			case 1: return Me(e.type, !0);
			case 31: return je("Activity");
			case 30: return je("ViewTransition");
			default: return "";
		}
	}
	function Pe(e) {
		try {
			var t = "", n = null;
			do
				t += Ne(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Fe = Object.prototype.hasOwnProperty, Ie = t.unstable_scheduleCallback, Le = t.unstable_cancelCallback, Re = t.unstable_shouldYield, ze = t.unstable_requestPaint, Be = t.unstable_now, Ve = t.unstable_getCurrentPriorityLevel, He = t.unstable_ImmediatePriority, Ue = t.unstable_UserBlockingPriority, We = t.unstable_NormalPriority, Ge = t.unstable_LowPriority, Ke = t.unstable_IdlePriority, qe = t.log, Je = t.unstable_setDisableYieldValue, Ye = null, Xe = null;
	function Ze(e) {
		if (typeof qe == "function" && Je(e), Xe && typeof Xe.setStrictMode == "function") try {
			Xe.setStrictMode(Ye, e);
		} catch {}
	}
	var Qe = Math.clz32 ? Math.clz32 : tt, $e = Math.log, et = Math.LN2;
	function tt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - ($e(e) / et | 0) | 0;
	}
	var nt = 256, rt = 262144, it = 4194304;
	function at(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function ot(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = at(n))) : i = at(o) : i = at(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = at(n))) : i = at(o)) : i = at(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function st(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function ct(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - Qe(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function lt(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function ut() {
		var e = it;
		return it <<= 1, !(it & 62914560) && (it = 4194304), e;
	}
	function dt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function ft(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function pt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Qe(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && mt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function mt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Qe(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function ht(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Qe(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function gt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : _t(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function _t(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function vt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function yt() {
		var e = I.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : wh(e.type)) : e;
	}
	function bt(e, t) {
		var n = I.p;
		try {
			return I.p = e, t();
		} finally {
			I.p = n;
		}
	}
	var xt = Math.random().toString(36).slice(2), St = "__reactFiber$" + xt, Ct = "__reactProps$" + xt, wt = "__reactContainer$" + xt, Tt = "__reactEvents$" + xt, Et = "__reactListeners$" + xt, Dt = "__reactHandles$" + xt, Ot = "__reactResources$" + xt, kt = "__reactMarker$" + xt, At = "__reactLoad$" + xt;
	function jt(e) {
		delete e[St], delete e[Ct], delete e[Et], delete e[Dt];
	}
	function Mt(e) {
		var t;
		if (t = e[St]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[wt] || n[St]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = pm(e); e !== null;) {
					if (n = e[St]) return n;
					e = pm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Nt(e) {
		if (e = e[St] || e[wt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Pt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Ft(e) {
		var t = e[Ot];
		return t ||= e[Ot] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function It(e) {
		e[kt] = !0;
	}
	function Lt(e) {
		e[At] = void 0;
	}
	var Rt = /* @__PURE__ */ new Set(), zt = {};
	function Bt(e, t) {
		Vt(e, t), Vt(e + "Capture", t);
	}
	function Vt(e, t) {
		for (zt[e] = t, e = 0; e < t.length; e++) Rt.add(t[e]);
	}
	var Ht = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Ut = {}, Wt = {};
	function Gt(e) {
		return Fe.call(Wt, e) ? !0 : Fe.call(Ut, e) ? !1 : Ht.test(e) ? Wt[e] = !0 : (Ut[e] = !0, !1);
	}
	var z = !1;
	function Kt() {
		var e = z;
		return z = !1, e;
	}
	function qt(e, t, n) {
		if (Gt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function Jt(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function Yt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function Xt(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function Zt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Qt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function $t(e) {
		if (!e._valueTracker) {
			var t = Zt(e) ? "checked" : "value";
			e._valueTracker = Qt(e, t, "" + e[t]);
		}
	}
	function en(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Zt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var tn = /[\n"\\]/g;
	function nn(e) {
		return e.replace(tn, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function rn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Xt(t)) : e.value !== "" + Xt(t) && (e.value = "" + Xt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : on(e, Xt(n)) : o === "number" && e.value == t ? on(e, Xt(e.value)) : on(e, Xt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Xt(s) : e.removeAttribute("name");
	}
	function an(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				$t(e);
				return;
			}
			n = n == null ? "" : "" + Xt(n), t = t == null ? n : "" + Xt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), $t(e);
	}
	function on(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function sn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Xt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function cn(e, t, n) {
		t != null && (t = "" + Xt(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + Xt(n);
	}
	function ln(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (he(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Xt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), $t(e);
	}
	function un(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var dn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function fn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || dn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function pn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", z = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (fn(e, a, r), z = !0);
		} else for (var o in t) t.hasOwnProperty(o) && fn(e, o, t[o]);
	}
	function mn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var hn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), gn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function _n(e) {
		return gn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function vn() {}
	var yn = null;
	function bn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var xn = null, Sn = null;
	function Cn(e) {
		var t = Nt(e);
		if (t && (e = t.stateNode)) {
			var n = e[Ct] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (rn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + nn("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[Ct] || null;
								if (!a) throw Error(i(90));
								rn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && en(r);
					}
					break a;
				case "textarea":
					cn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && sn(e, !!n.multiple, t, !1);
			}
		}
	}
	var wn = !1;
	function Tn(e, t, n) {
		if (wn) return e(t, n);
		wn = !0;
		try {
			return e(t);
		} finally {
			if (wn = !1, (xn !== null || Sn !== null) && (Bd(), xn && (t = xn, e = Sn, Sn = xn = null, Cn(t), e))) for (t = 0; t < e.length; t++) Cn(e[t]);
		}
	}
	function En(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[Ct] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var Dn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, On = !1;
	if (Dn) try {
		var kn = {};
		Object.defineProperty(kn, "passive", { get: function() {
			On = !0;
		} }), window.addEventListener("test", kn, kn), window.removeEventListener("test", kn, kn);
	} catch {
		On = !1;
	}
	var An = null, jn = null, Mn = null;
	function Nn() {
		if (Mn) return Mn;
		var e, t = jn, n = t.length, r, i = "value" in An ? An.value : An.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Mn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Pn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Fn() {
		return !0;
	}
	function In() {
		return !1;
	}
	function Ln(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Fn : In, this.isPropagationStopped = In, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Fn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Fn);
			},
			persist: function() {},
			isPersistent: Fn
		}), t;
	}
	var Rn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, zn = Ln(Rn), Bn = D({}, Rn, {
		view: 0,
		detail: 0
	}), Vn = Ln(Bn), Hn, Un, Wn, Gn = D({}, Bn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: nr,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Wn && (Wn && e.type === "mousemove" ? (Hn = e.screenX - Wn.screenX, Un = e.screenY - Wn.screenY) : Un = Hn = 0, Wn = e), Hn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Un;
		}
	}), Kn = Ln(Gn), qn = Ln(D({}, Gn, { dataTransfer: 0 })), Jn = Ln(D({}, Bn, { relatedTarget: 0 })), Yn = Ln(D({}, Rn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Xn = Ln(D({}, Rn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Zn = Ln(D({}, Rn, { data: 0 })), Qn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, $n = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, er = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function tr(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = er[e]) ? !!t[e] : !1;
	}
	function nr() {
		return tr;
	}
	var rr = Ln(D({}, Bn, {
		key: function(e) {
			if (e.key) {
				var t = Qn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Pn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? $n[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: nr,
		charCode: function(e) {
			return e.type === "keypress" ? Pn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Pn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), ir = Ln(D({}, Gn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), ar = Ln(D({}, Rn, { submitter: 0 })), or = Ln(D({}, Bn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: nr
	})), sr = Ln(D({}, Rn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), cr = Ln(D({}, Gn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), lr = Ln(D({}, Rn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), ur = [
		9,
		13,
		27,
		32
	], dr = Dn && "CompositionEvent" in window, fr = null;
	Dn && "documentMode" in document && (fr = document.documentMode);
	var pr = Dn && "TextEvent" in window && !fr, mr = Dn && (!dr || fr && 8 < fr && 11 >= fr), hr = " ", gr = !1;
	function _r(e, t) {
		switch (e) {
			case "keyup": return ur.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function vr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var yr = !1;
	function br(e, t) {
		switch (e) {
			case "compositionend": return vr(t);
			case "keypress": return t.which === 32 ? (gr = !0, hr) : null;
			case "textInput": return e = t.data, e === hr && gr ? null : e;
			default: return null;
		}
	}
	function xr(e, t) {
		if (yr) return e === "compositionend" || !dr && _r(e, t) ? (e = Nn(), Mn = jn = An = null, yr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return mr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Sr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Cr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Sr[e.type] : t === "textarea";
	}
	function wr(e, t, n, r) {
		xn ? Sn ? Sn.push(r) : Sn = [r] : xn = r, t = Yf(t, "onChange"), 0 < t.length && (n = new zn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Tr = null, Er = null;
	function Dr(e) {
		Hf(e, 0);
	}
	function Or(e) {
		if (en(Pt(e))) return e;
	}
	function kr(e, t) {
		if (e === "change") return t;
	}
	var Ar = !1;
	if (Dn) {
		var jr;
		if (Dn) {
			var Mr = "oninput" in document;
			if (!Mr) {
				var Nr = document.createElement("div");
				Nr.setAttribute("oninput", "return;"), Mr = typeof Nr.oninput == "function";
			}
			jr = Mr;
		} else jr = !1;
		Ar = jr && (!document.documentMode || 9 < document.documentMode);
	}
	function Pr() {
		Tr && (Tr.detachEvent("onpropertychange", Fr), Er = Tr = null);
	}
	function Fr(e) {
		if (e.propertyName === "value" && Or(Er)) {
			var t = [];
			wr(t, Er, e, bn(e)), Tn(Dr, t);
		}
	}
	function Ir(e, t, n) {
		e === "focusin" ? (Pr(), Tr = t, Er = n, Tr.attachEvent("onpropertychange", Fr)) : e === "focusout" && Pr();
	}
	function Lr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Or(Er);
	}
	function Rr(e, t) {
		if (e === "click") return Or(t);
	}
	function zr(e, t) {
		if (e === "input" || e === "change") return Or(t);
	}
	function Br(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Vr = typeof Object.is == "function" ? Object.is : Br;
	function Hr(e, t) {
		if (Vr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Fe.call(t, i) || !Vr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Ur(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Wr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Gr(e, t) {
		var n = Wr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Wr(n);
		}
	}
	function Kr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Kr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function qr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ur(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ur(e.document);
		}
		return t;
	}
	function Jr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Yr = Dn && "documentMode" in document && 11 >= document.documentMode, Xr = null, Zr = null, Qr = null, $r = !1;
	function ei(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		$r || Xr == null || Xr !== Ur(r) || (r = Xr, "selectionStart" in r && Jr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Qr && Hr(Qr, r) || (Qr = r, r = Yf(Zr, "onSelect"), 0 < r.length && (t = new zn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Xr)));
	}
	function ti(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var ni = {
		animationend: ti("Animation", "AnimationEnd"),
		animationiteration: ti("Animation", "AnimationIteration"),
		animationstart: ti("Animation", "AnimationStart"),
		transitionrun: ti("Transition", "TransitionRun"),
		transitionstart: ti("Transition", "TransitionStart"),
		transitioncancel: ti("Transition", "TransitionCancel"),
		transitionend: ti("Transition", "TransitionEnd")
	}, ri = {}, ii = {};
	Dn && (ii = document.createElement("div").style, "AnimationEvent" in window || (delete ni.animationend.animation, delete ni.animationiteration.animation, delete ni.animationstart.animation), "TransitionEvent" in window || delete ni.transitionend.transition);
	function ai(e) {
		if (ri[e]) return ri[e];
		if (!ni[e]) return e;
		var t = ni[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ii) return ri[e] = t[n];
		return e;
	}
	var oi = ai("animationend"), B = ai("animationiteration"), si = ai("animationstart"), ci = ai("transitionrun"), li = ai("transitionstart"), ui = ai("transitioncancel"), di = ai("transitionend"), fi = /* @__PURE__ */ new Map(), pi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	pi.push("scrollEnd");
	function mi(e, t) {
		fi.set(e, t), Bt(t, [e]);
	}
	var hi = 0;
	function gi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = xd.identifierPrefix;
		var n = hi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function _i(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = kd;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function vi(e, t) {
		return e = _i(e), t = _i(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var yi = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, bi = [], xi = 0, Si = 0;
	function Ci() {
		for (var e = xi, t = Si = xi = 0; t < e;) {
			var n = bi[t];
			bi[t++] = null;
			var r = bi[t];
			bi[t++] = null;
			var i = bi[t];
			bi[t++] = null;
			var a = bi[t];
			if (bi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Di(n, i, a);
		}
	}
	function wi(e, t, n, r) {
		bi[xi++] = e, bi[xi++] = t, bi[xi++] = n, bi[xi++] = r, Si |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ti(e, t, n, r) {
		return wi(e, t, n, r), Oi(e);
	}
	function Ei(e, t) {
		return wi(e, null, null, t), Oi(e);
	}
	function Di(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Qe(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Oi(e) {
		if (50 < Ad) throw Ad = 0, jd = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var ki = {};
	function Ai(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ji(e, t, n, r) {
		return new Ai(e, t, n, r);
	}
	function Mi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Ni(e, t) {
		var n = e.alternate;
		return n === null ? (n = ji(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Pi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Fi(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Mi(r) && (s = 1);
		else if (typeof r == "string") s = Jm(e, n, xe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case P: return e = ji(31, n, t, a), e.elementType = P, e.lanes = o, e;
			case j: return Ii(n.children, a, o, t);
			case M:
				s = 8, a |= 24;
				break;
			case N: return e = ji(12, n, t, a | 2), e.elementType = N, e.lanes = o, e;
			case re: return e = ji(13, n, t, a), e.elementType = re, e.lanes = o, e;
			case ie: return e = ji(19, n, t, a), e.elementType = ie, e.lanes = o, e;
			case se:
			case le: return e = a | 32, e = ji(30, n, t, e), e.elementType = le, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case te:
						s = 10;
						break a;
					case ee:
						s = 9;
						break a;
					case ne:
						s = 11;
						break a;
					case ae:
						s = 14;
						break a;
					case oe:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = ji(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Ii(e, t, n, r) {
		return e = ji(7, e, r, t), e.lanes = n, e;
	}
	function Li(e, t, n) {
		return e = ji(6, e, null, t), e.lanes = n, e;
	}
	function Ri(e) {
		var t = ji(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function zi(e, t, n) {
		return t = ji(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Bi = /* @__PURE__ */ new WeakMap();
	function Vi(e, t) {
		if (typeof e == "object" && e) {
			var n = Bi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Pe(t)
			}, Bi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Pe(t)
		};
	}
	var Hi = [], Ui = 0, Wi = null, Gi = 0, Ki = [], qi = 0, Ji = null, Yi = 1, Xi = "";
	function Zi(e, t) {
		Hi[Ui++] = Gi, Hi[Ui++] = Wi, Wi = e, Gi = t;
	}
	function Qi(e, t, n) {
		Ki[qi++] = Yi, Ki[qi++] = Xi, Ki[qi++] = Ji, Ji = e;
		var r = Yi;
		e = Xi;
		var i = 32 - Qe(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Qe(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Yi = 1 << 32 - Qe(t) + i | n << i | r, Xi = a + e;
		} else Yi = 1 << a | n << i | r, Xi = e;
	}
	function $i(e) {
		e.return !== null && (Zi(e, 1), Qi(e, 1, 0));
	}
	function ea(e) {
		for (; e === Wi;) Wi = Hi[--Ui], Hi[Ui] = null, Gi = Hi[--Ui], Hi[Ui] = null;
		for (; e === Ji;) Ji = Ki[--qi], Ki[qi] = null, Xi = Ki[--qi], Ki[qi] = null, Yi = Ki[--qi], Ki[qi] = null;
	}
	function ta(e, t) {
		Ki[qi++] = Yi, Ki[qi++] = Xi, Ki[qi++] = Ji, Yi = t.id, Xi = t.overflow, Ji = e;
	}
	var na = null, ra = null, V = !1, ia = null, aa = !1, oa = Error(i(519));
	function sa(e) {
		throw pa(Vi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), oa;
	}
	function ca(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[St] = e, t[Ct] = r, n) {
			case "dialog":
				Z("cancel", t), Z("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Z("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Bf.length; n++) Z(Bf[n], t);
				break;
			case "source":
				Z("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Z("error", t), Z("load", t);
				break;
			case "details":
				Z("toggle", t);
				break;
			case "input":
				Z("invalid", t), an(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Z("invalid", t);
				break;
			case "textarea": Z("invalid", t), ln(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || tp(t.textContent, n) ? (r.popover != null && (Z("beforetoggle", t), Z("toggle", t)), r.onScroll != null && Z("scroll", t), r.onScrollEnd != null && Z("scrollend", t), r.onClick != null && (t.onclick = vn), t = !0) : t = !1, t || sa(e, !0);
	}
	function la(e) {
		for (na = e.return; na;) switch (na.tag) {
			case 5:
			case 31:
			case 13:
				aa = !1;
				return;
			case 27:
			case 3:
				aa = !0;
				return;
			default: na = na.return;
		}
	}
	function ua(e) {
		if (e !== na) return !1;
		if (!V) return la(e), V = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || mp(e.type, e.memoizedProps)), n = !n), n && ra && sa(e), la(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			ra = fm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			ra = fm(e);
		} else t === 27 ? (t = ra, Cp(e.type) ? (e = dm, dm = null, ra = e) : ra = t) : ra = na ? um(e.stateNode.nextSibling) : null;
		return !0;
	}
	function da() {
		ra = na = null, V = !1;
	}
	function fa() {
		var e = ia;
		return e !== null && (pd === null ? pd = e : pd.push.apply(pd, e), ia = null), e;
	}
	function pa(e) {
		ia === null ? ia = [e] : ia.push(e);
	}
	var ma = L(null), ha = null, ga = null;
	function _a(e, t, n) {
		be(ma, t._currentValue), t._currentValue = n;
	}
	function va(e) {
		e._currentValue = ma.current, ye(ma);
	}
	function ya(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ba(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), ya(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), ya(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ya(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function xa(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					Vr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === we.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [ch] : e.push(ch));
			}
			a = a.return;
		}
		return e !== null && ba(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Sa(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Vr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ca(e) {
		ha = e, ga = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function wa(e) {
		return Ea(ha, e);
	}
	function Ta(e, t) {
		return ha === null && Ca(e), Ea(e, t);
	}
	function Ea(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, ga === null) {
			if (e === null) throw Error(i(308));
			ga = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else ga = ga.next = t;
		return n;
	}
	var Da = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Oa = t.unstable_scheduleCallback, ka = t.unstable_NormalPriority, Aa = {
		$$typeof: te,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ja() {
		return {
			controller: new Da(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Ma(e) {
		e.refCount--, e.refCount === 0 && Oa(ka, function() {
			e.controller.abort();
		});
	}
	function Na(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Pa = null;
	function Fa(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var Ia = null, La = 0, Ra = 0, za = null;
	function Ba(e, t) {
		if (Ia === null) {
			var n = Ia = [];
			La = 0, Ra = Ff(), za = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return La++, t.then(Va, Va), t;
	}
	function Va() {
		if (--La === 0 && (Pa = null, Ia !== null)) {
			za !== null && (za.status = "fulfilled");
			var e = Ia;
			Ia = null, Ra = 0, za = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ha(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Ua = F.S;
	F.S = function(e, t) {
		if (gd = Be(), typeof t == "object" && t && typeof t.then == "function" && Ba(e, t), Pa !== null) for (var n = xf; n !== null;) Na(n, Pa), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = xf; r !== null;) Na(r, n), r = r.next;
			if (Ra !== 0) {
				r = Pa, r === null && (r = Pa = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ua !== null && Ua(e, t);
	};
	var Wa = L(null);
	function Ga() {
		var e = Wa.current;
		return e === null ? $u.pooledCache : e;
	}
	function Ka(e, t) {
		t === null ? be(Wa, Wa.current) : be(Wa, t.pool);
	}
	function qa() {
		var e = Ga();
		return e === null ? null : {
			parent: Aa._currentValue,
			pool: e
		};
	}
	var Ja = Error(i(460)), Ya = Error(i(474)), Xa = Error(i(542)), Za = { then: function() {} };
	function Qa(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function $a(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(vn, vn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, ro(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(vn, vn);
				else {
					if (e = $u, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, ro(e), e;
				}
				throw to = t, Ja;
		}
	}
	function eo(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (to = e, Ja) : e;
		}
	}
	var to = null;
	function no() {
		if (to === null) throw Error(i(459));
		var e = to;
		return to = null, e;
	}
	function ro(e) {
		if (e === Ja || e === Xa) throw Error(i(483));
	}
	var io = null, ao = 0;
	function oo(e) {
		var t = ao;
		return ao += 1, io === null && (io = []), $a(io, e, t);
	}
	function so(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function co(e, t) {
		throw t.$$typeof === O ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function lo(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Ni(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Li(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === j ? (e = d(e, t, n.props.children, r, n.key), so(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === oe && eo(i) === t.type) ? (t = a(t, n.props), so(t, n), t.return = e, t) : (t = Fi(n.type, n.key, n.props, null, e.mode, r), so(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = zi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Ii(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Li("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case k: return n = Fi(t.type, t.key, t.props, null, e.mode, n), so(n, t), n.return = e, n;
					case A: return t = zi(t, e.mode, n), t.return = e, t;
					case oe: return t = eo(t), f(e, t, n);
				}
				if (he(t) || fe(t)) return t = Ii(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, oo(t), n);
				if (t.$$typeof === te) return f(e, Ta(e, t), n);
				co(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case k: return n.key === i ? l(e, t, n, r) : null;
					case A: return n.key === i ? u(e, t, n, r) : null;
					case oe: return n = eo(n), p(e, t, n, r);
				}
				if (he(n) || fe(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, oo(n), r);
				if (n.$$typeof === te) return p(e, t, Ta(e, n), r);
				co(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case k: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case A: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case oe: return r = eo(r), m(e, t, n, r, i);
				}
				if (he(r) || fe(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, oo(r), i);
				if (r.$$typeof === te) return m(e, t, n, Ta(t, r), i);
				co(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), V && Zi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return V && Zi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), V && Zi(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), V && Zi(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return V && Zi(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), V && Zi(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === j && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case k:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === j) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), so(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === oe && eo(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), so(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === j ? (c = Ii(o.props.children, e.mode, c, o.key), so(c, o), c.return = e, e = c) : (c = Fi(o.type, o.key, o.props, null, e.mode, c), so(c, o), c.return = e, e = c);
						}
						return s(e);
					case A:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = zi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case oe: return o = eo(o), _(e, r, o, c);
				}
				if (he(o)) return h(e, r, o, c);
				if (fe(o)) {
					if (l = fe(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, oo(o), c);
				if (o.$$typeof === te) return _(e, r, Ta(e, o), c);
				co(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Li(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				ao = 0;
				var i = _(e, t, n, r);
				return io = null, i;
			} catch (t) {
				if (t === Ja || t === Xa) throw t;
				var a = ji(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var uo = lo(!0), fo = lo(!1), po = !1;
	function mo(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function ho(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function go(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function _o(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Qu & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Oi(e), Di(e, null, n), t;
		}
		return wi(e, r, t, n), Oi(e);
	}
	function vo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, ht(e, n);
		}
	}
	function yo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var bo = !1;
	function xo() {
		if (bo) {
			var e = za;
			if (e !== null) throw e;
		}
	}
	function So(e, t, n, r) {
		bo = !1;
		var i = e.updateQueue;
		po = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Y & f) === f : (r & f) === f) {
					f !== 0 && f === Ra && (bo = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = D({}, d, f);
								break a;
							case 2: po = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), sd |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function Co(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function wo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Co(n[e], t);
	}
	var To = L(null), Eo = L(0);
	function Do(e, t) {
		e = ad, be(Eo, e), be(To, t), ad = e | t.baseLanes;
	}
	function Oo() {
		be(Eo, ad), be(To, To.current);
	}
	function ko() {
		ad = Eo.current, ye(To), ye(Eo);
	}
	var Ao = L(null), jo = null;
	function Mo(e) {
		var t = e.alternate;
		be(Lo, Lo.current & 1), be(Ao, e), jo === null && (t === null || To.current !== null || t.memoizedState !== null) && (jo = e);
	}
	function No(e) {
		be(Lo, Lo.current), be(Ao, e), jo === null && (jo = e);
	}
	function Po(e) {
		e.tag === 22 ? (be(Lo, Lo.current), be(Ao, e), jo === null && (jo = e)) : Fo();
	}
	function Fo() {
		be(Lo, Lo.current), be(Ao, Ao.current);
	}
	function Io(e) {
		ye(Ao), jo === e && (jo = null), ye(Lo);
	}
	var Lo = L(0);
	function Ro(e, t) {
		be(Ao, Ao.current), be(Lo, t);
	}
	function zo(e) {
		ye(Lo), ye(Ao), jo === e && (jo = null);
	}
	function Bo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || sm(n) || cm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Vo = 0, H = null, Ho = null, Uo = null, Wo = !1, Go = !1, Ko = !1, qo = 0, Jo = 0, Yo = null, Xo = 0;
	function Zo() {
		throw Error(i(321));
	}
	function Qo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Vr(e[n], t[n])) return !1;
		return !0;
	}
	function $o(e, t, n, r, i, a) {
		return Vo = a, H = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, F.H = e === null || e.memoizedState === null ? mc : hc, Ko = !1, a = n(r, i), Ko = !1, Go && (a = ts(t, n, r, i)), es(e), a;
	}
	function es(e) {
		F.H = pc;
		var t = Ho !== null && Ho.next !== null;
		if (Vo = 0, Uo = Ho = H = null, Wo = !1, Jo = 0, Yo = null, t) throw Error(i(300));
		e === null || Mc || (e = e.dependencies, e !== null && Sa(e) && (Mc = !0));
	}
	function ts(e, t, n, r) {
		H = e;
		var a = 0;
		do {
			if (Go && (Yo = null), Jo = 0, Go = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Uo = Ho = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			F.H = gc, o = t(n, r);
		} while (Go);
		return o;
	}
	function ns() {
		var e = F.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? cs(t) : t, e = e.useState()[0], (Ho === null ? null : Ho.memoizedState) !== e && (H.flags |= 1024), t;
	}
	function U() {
		var e = qo !== 0;
		return qo = 0, e;
	}
	function rs(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function is(e) {
		if (Wo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Wo = !1;
		}
		Vo = 0, Uo = Ho = H = null, Go = !1, Jo = qo = 0, Yo = null;
	}
	function as() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Uo === null ? H.memoizedState = Uo = e : Uo = Uo.next = e, Uo;
	}
	function os() {
		if (Ho === null) {
			var e = H.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Ho.next;
		var t = Uo === null ? H.memoizedState : Uo.next;
		if (t !== null) Uo = t, Ho = e;
		else {
			if (e === null) throw H.alternate === null ? Error(i(467)) : Error(i(310));
			Ho = e, e = {
				memoizedState: Ho.memoizedState,
				baseState: Ho.baseState,
				baseQueue: Ho.baseQueue,
				queue: Ho.queue,
				next: null
			}, Uo === null ? H.memoizedState = Uo = e : Uo = Uo.next = e;
		}
		return Uo;
	}
	function ss() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function cs(e) {
		var t = Jo;
		return Jo += 1, Yo === null && (Yo = []), e = $a(Yo, e, t), t = H, (Uo === null ? t.memoizedState : Uo.next) === null && (t = t.alternate, F.H = t === null || t.memoizedState === null ? mc : hc), e;
	}
	function ls(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return cs(e);
			if (e.$$typeof === ue) return;
			if (e.$$typeof === te) return wa(e);
		}
		throw Error(i(438, String(e)));
	}
	function us(e) {
		var t = null, n = H.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = H.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = ss(), H.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ce;
		return t.index++, n;
	}
	function ds(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function fs(e) {
		return ps(os(), Ho, e);
	}
	function ps(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Vo & f) === f : (Y & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Ra && (d = !0);
					else if ((Vo & p) === p) {
						u = u.next, p === Ra && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, H.lanes |= p, sd |= p;
					f = u.action, Ko && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, H.lanes |= f, sd |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Vr(o, e.memoizedState) && (Mc = !0, d && (n = za, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function ms(e) {
		var t = os(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Vr(o, t.memoizedState) || (Mc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function hs(e, t, n) {
		var r = H, a = os(), o = V;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Vr((Ho || a).memoizedState, n);
		if (s && (a.memoizedState = n, Mc = !0), a = a.queue, zs(_s.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Uo !== null && !!(Uo.memoizedState.tag & 1), Ps(e ? 9 : 8, { destroy: void 0 }, gs.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, $u === null) throw Error(i(349));
			o || Vo & 127 || W(r, t, n);
		}
		return n;
	}
	function W(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = H.updateQueue, t === null ? (t = ss(), H.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function gs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, vs(t) && ys(e);
	}
	function _s(e, t, n) {
		return n(function() {
			vs(t) && ys(e);
		});
	}
	function vs(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Vr(e, n);
		} catch {
			return !0;
		}
	}
	function ys(e) {
		var t = Ei(e, 2);
		t !== null && Fd(t, e, 2);
	}
	function bs(e) {
		var t = as();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Ko) {
				Ze(!0);
				try {
					n();
				} finally {
					Ze(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ds,
			lastRenderedState: e
		}, t;
	}
	function xs(e, t, n, r) {
		return e.baseState = n, ps(e, Ho, typeof r == "function" ? r : ds);
	}
	function Ss(e, t, n, r, a) {
		if (uc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			F.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Cs(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Cs(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = F.T, o = {};
			o.types = a === null ? null : a.types, F.T = o;
			try {
				var s = n(i, r), c = F.S;
				c !== null && c(o, s), ws(e, t, s);
			} catch (n) {
				Es(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), F.T = a;
			}
		} else try {
			a = n(i, r), ws(e, t, a);
		} catch (n) {
			Es(e, t, n);
		}
	}
	function ws(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Ts(e, t, n);
		}, function(n) {
			return Es(e, t, n);
		}) : Ts(e, t, n);
	}
	function Ts(e, t, n) {
		t.status = "fulfilled", t.value = n, Ds(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Cs(e, n)));
	}
	function Es(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Ds(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Ds(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Os(e, t) {
		return t;
	}
	function ks(e, t) {
		if (V) {
			var n = $u.formState;
			if (n !== null) {
				a: {
					var r = H;
					if (V) {
						if (ra) {
							b: {
								for (var i = ra, a = aa; i.nodeType !== 8;) if (!a || (i = um(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								ra = um(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						sa(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = as(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Os,
			lastRenderedState: t
		}, n.queue = r, n = sc.bind(null, H, r), r.dispatch = n, r = bs(!1), a = lc.bind(null, H, !1, r.queue), r = as(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ss.bind(null, H, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function As(e) {
		return js(os(), Ho, e);
	}
	function js(e, t, n) {
		if (t = ps(e, t, Os)[0], e = fs(ds)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = cs(t);
		} catch (e) {
			throw e === Ja ? Xa : e;
		}
		else r = t;
		t = os();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (H.flags |= 2048, Ps(9, { destroy: void 0 }, Ms.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ms(e, t) {
		e.action = t;
	}
	function Ns(e) {
		var t = os(), n = Ho;
		if (n !== null) return js(t, n, e);
		os(), t = t.memoizedState, n = os();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Ps(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = H.updateQueue, t === null && (t = ss(), H.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Fs() {
		return os().memoizedState;
	}
	function Is(e, t, n, r) {
		var i = as();
		H.flags |= e, i.memoizedState = Ps(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Ls(e, t, n, r) {
		var i = os();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Ho !== null && r !== null && Qo(r, Ho.memoizedState.deps) ? i.memoizedState = Ps(t, a, n, r) : (H.flags |= e, i.memoizedState = Ps(1 | t, a, n, r));
	}
	function Rs(e, t) {
		Is(8390656, 8, e, t);
	}
	function zs(e, t) {
		Ls(2048, 8, e, t);
	}
	function Bs(e) {
		H.flags |= 4;
		var t = H.updateQueue;
		if (t === null) t = ss(), H.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Vs(e) {
		var t = os().memoizedState;
		return Bs({
			ref: t,
			nextImpl: e
		}), function() {
			if (Qu & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Hs(e, t) {
		return Ls(4, 2, e, t);
	}
	function Us(e, t) {
		return Ls(4, 4, e, t);
	}
	function Ws(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Gs(e, t, n) {
		n = n == null ? null : n.concat([e]), Ls(4, 4, Ws.bind(null, t, e), n);
	}
	function Ks() {}
	function qs(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Qo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Js(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Qo(t, r[1])) return r[0];
		if (r = e(), Ko) {
			Ze(!0);
			try {
				e();
			} finally {
				Ze(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Ys(e, t, n) {
		return n === void 0 || Vo & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Nd(), H.lanes |= e, sd |= e, n);
	}
	function Xs(e, t, n, r) {
		return Vr(n, t) ? n : To.current === null ? !(Vo & 106) || Vo & 1073741824 && !(Y & 261930) ? (Mc = !0, e.memoizedState = n) : (e = Nd(), H.lanes |= e, sd |= e, t) : (e = Ys(e, n, r), Vr(e, t) || (Mc = !0), e);
	}
	function Zs(e, t, n, r, i) {
		var a = I.p;
		I.p = a !== 0 && 8 > a ? a : 8;
		var o = F.T, s = {};
		s.types = o === null ? null : o.types, F.T = s, lc(e, !1, t, n);
		try {
			var c = i(), l = F.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? cc(e, t, Ha(c, r), Md(e)) : cc(e, t, r, Md(e));
		} catch (n) {
			cc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, Md());
		} finally {
			I.p = a, o !== null && s.types !== null && (o.types = s.types), F.T = o;
		}
	}
	function Qs() {}
	function $s(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = ec(e).queue;
		Zs(e, a, t, ge, n === null ? Qs : function() {
			return tc(e), n(r);
		});
	}
	function ec(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: ge,
			baseState: ge,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ds,
				lastRenderedState: ge
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ds,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function tc(e) {
		var t = ec(e);
		t.next === null && (t = e.alternate.memoizedState), cc(e, t.next.queue, {}, Md());
	}
	function nc() {
		return wa(ch);
	}
	function rc() {
		return os().memoizedState;
	}
	function ic() {
		return os().memoizedState;
	}
	function ac(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = Md();
					e = go(n);
					var r = _o(t, e, n);
					r !== null && (Fd(r, t, n), vo(r, t, n)), t = { cache: ja() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function oc(e, t, n) {
		var r = Md();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, uc(e) ? dc(t, n) : (n = Ti(e, t, n, r), n !== null && (Fd(n, e, r), fc(n, t, r)));
	}
	function sc(e, t, n) {
		cc(e, t, n, Md());
	}
	function cc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (uc(e)) dc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Vr(s, o)) return wi(e, t, i, 0), $u === null && Ci(), !1;
			} catch {}
			if (n = Ti(e, t, i, r), n !== null) return Fd(n, e, r), fc(n, t, r), !0;
		}
		return !1;
	}
	function lc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Ff(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, uc(e)) {
			if (t) throw Error(i(479));
		} else t = Ti(e, n, r, 2), t !== null && Fd(t, e, 2);
	}
	function uc(e) {
		var t = e.alternate;
		return e === H || t !== null && t === H;
	}
	function dc(e, t) {
		Go = Wo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function fc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, ht(e, n);
		}
	}
	var pc = {
		readContext: wa,
		use: ls,
		useCallback: Zo,
		useContext: Zo,
		useEffect: Zo,
		useImperativeHandle: Zo,
		useLayoutEffect: Zo,
		useInsertionEffect: Zo,
		useMemo: Zo,
		useReducer: Zo,
		useRef: Zo,
		useState: Zo,
		useDebugValue: Zo,
		useDeferredValue: Zo,
		useTransition: Zo,
		useSyncExternalStore: Zo,
		useId: Zo,
		useHostTransitionStatus: Zo,
		useFormState: Zo,
		useActionState: Zo,
		useOptimistic: Zo,
		useMemoCache: Zo,
		useCacheRefresh: Zo,
		useEffectEvent: Zo
	}, mc = {
		readContext: wa,
		use: ls,
		useCallback: function(e, t) {
			return as().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: wa,
		useEffect: Rs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Is(4194308, 4, Ws.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Is(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Is(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = as();
			t = t === void 0 ? null : t;
			var r = e();
			if (Ko) {
				Ze(!0);
				try {
					e();
				} finally {
					Ze(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = as();
			if (n !== void 0) {
				var i = n(t);
				if (Ko) {
					Ze(!0);
					try {
						n(t);
					} finally {
						Ze(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = oc.bind(null, H, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = as();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = bs(e);
			var t = e.queue, n = sc.bind(null, H, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			return Ys(as(), e, t);
		},
		useTransition: function() {
			var e = bs(!1);
			return e = Zs.bind(null, H, e.queue, !0, !1), as().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = H, a = as();
			if (V) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), $u === null) throw Error(i(349));
				Y & 127 || W(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Rs(_s.bind(null, r, o, e), [e]), r.flags |= 2048, Ps(9, { destroy: void 0 }, gs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = as(), t = $u.identifierPrefix;
			if (V) {
				var n = Xi, r = Yi;
				n = (r & ~(1 << 32 - Qe(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = qo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Xo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: nc,
		useFormState: ks,
		useActionState: ks,
		useOptimistic: function(e) {
			var t = as();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = lc.bind(null, H, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: us,
		useCacheRefresh: function() {
			return as().memoizedState = ac.bind(null, H);
		},
		useEffectEvent: function(e) {
			var t = as(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Qu & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, hc = {
		readContext: wa,
		use: ls,
		useCallback: qs,
		useContext: wa,
		useEffect: zs,
		useImperativeHandle: Gs,
		useInsertionEffect: Hs,
		useLayoutEffect: Us,
		useMemo: Js,
		useReducer: fs,
		useRef: Fs,
		useState: function() {
			return fs(ds);
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			return Xs(os(), Ho.memoizedState, e, t);
		},
		useTransition: function() {
			var e = fs(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: rc,
		useHostTransitionStatus: nc,
		useFormState: As,
		useActionState: As,
		useOptimistic: function(e, t) {
			return xs(os(), Ho, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ic,
		useEffectEvent: Vs
	}, gc = {
		readContext: wa,
		use: ls,
		useCallback: qs,
		useContext: wa,
		useEffect: zs,
		useImperativeHandle: Gs,
		useInsertionEffect: Hs,
		useLayoutEffect: Us,
		useMemo: Js,
		useReducer: ms,
		useRef: Fs,
		useState: function() {
			return ms(ds);
		},
		useDebugValue: Ks,
		useDeferredValue: function(e, t) {
			var n = os();
			return Ho === null ? Ys(n, e, t) : Xs(n, Ho.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ms(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: rc,
		useHostTransitionStatus: nc,
		useFormState: Ns,
		useActionState: Ns,
		useOptimistic: function(e, t) {
			var n = os();
			return Ho === null ? (n.baseState = e, [e, n.queue.dispatch]) : xs(n, Ho, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ic,
		useEffectEvent: Vs
	};
	function _c(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var vc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = Md(), i = go(r);
			i.payload = t, n != null && (i.callback = n), t = _o(e, i, r), t !== null && (Fd(t, e, r), vo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = Md(), i = go(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = _o(e, i, r), t !== null && (Fd(t, e, r), vo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = Md(), r = go(n);
			r.tag = 2, t != null && (r.callback = t), t = _o(e, r, n), t !== null && (Fd(t, e, n), vo(t, e, n));
		}
	};
	function yc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Hr(n, r) || !Hr(i, a) : !0;
	}
	function bc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && vc.enqueueReplaceState(t, t.state, null);
	}
	function xc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Sc(e) {
		yi(e);
	}
	function Cc(e) {
		console.error(e);
	}
	function wc(e) {
		yi(e);
	}
	function Tc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Ec(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Dc(e, t, n) {
		return n = go(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Tc(e, t);
		}, n;
	}
	function Oc(e) {
		return e = go(e), e.tag = 3, e;
	}
	function kc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Ec(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Ec(t, n, r), typeof i != "function" && (yd === null ? yd = /* @__PURE__ */ new Set([this]) : yd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Ac(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && xa(t, n, a, !0), n = Ao.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return jo === null ? qd() : n.alternate === null && od === 0 && (od = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === Za ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), hf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === Za ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), hf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return hf(e, r, a), qd(), !1;
		}
		if (V) return t = Ao.current, t === null ? (r !== oa && (t = Error(i(423), { cause: r }), pa(Vi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Vi(r, n), a = Dc(e.stateNode, r, a), yo(e, a), od !== 4 && (od = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== oa && (e = Error(i(422), { cause: r }), pa(Vi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Vi(o, n), fd === null ? fd = [o] : fd.push(o), od !== 4 && (od = 2), t === null) return !0;
		r = Vi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Dc(n.stateNode, r, e), yo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (yd === null || !yd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Oc(a), kc(a, e, n, r), yo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var jc = Error(i(461)), Mc = !1;
	function Nc(e, t, n, r) {
		t.child = e === null ? fo(t, null, n, r) : uo(t, e.child, n, r);
	}
	function Pc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ca(t), r = $o(e, t, n, o, a, i), s = U(), e !== null && !Mc ? (rs(e, t, i), cl(e, t, i)) : (V && s && $i(t), t.flags |= 1, Nc(e, t, r, i), t.child);
	}
	function Fc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Mi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Ic(e, t, a, r, i)) : (e = Fi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !ll(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Hr : n, n(o, r) && e.ref === t.ref) return cl(e, t, i);
		}
		return t.flags |= 1, e = Ni(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Ic(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Hr(a, r) && e.ref === t.ref) {
				if (Mc = !1, t.pendingProps = r = a, ll(e, i)) e.flags & 131072 && (Mc = !0);
				else return t.lanes = e.lanes, cl(e, t, i);
			}
		}
		return Wc(e, t, n, r, i);
	}
	function Lc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return zc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ka(t, a === null ? null : a.cachePool), a === null ? Oo() : Do(t, a), Po(t);
			else return r = t.lanes = 536870912, zc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ka(t, null), Oo(), Fo()) : (Ka(t, a.cachePool), Do(t, a), Fo(), t.memoizedState = null);
		return Nc(e, t, i, n), t.child;
	}
	function Rc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function zc(e, t, n, r, i) {
		var a = Ga();
		return a = a === null ? null : {
			parent: Aa._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ka(t, null), Oo(), Po(t), e !== null && xa(e, t, r, !0), t.childLanes = i, null;
	}
	function Bc(e, t) {
		return t = $c({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Vc(e, t, n) {
		return uo(t, e.child, null, n), e = Bc(t, t.pendingProps), e.flags |= 2, Io(t), t.memoizedState = null, e;
	}
	function Hc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (V) {
				if (r.mode === "hidden") return e = Bc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Rc(null, e);
				if (No(t), (e = ra) ? (e = om(e, aa), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ji === null ? null : {
						id: Yi,
						overflow: Xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ri(e), n.return = t, t.child = n, na = t, ra = null)) : e = null, e === null) throw sa(t);
				return t.lanes = 536870912, null;
			}
			return Bc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (No(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Vc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Mc || xa(e, t, n, !1), a = (n & e.childLanes) !== 0, Mc || a) {
				if (To.current === null) {
					if (r = $u, r !== null && (s = gt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Ei(e, s), Fd(r, e, s), jc;
					qd();
				}
				t = Vc(e, t, n);
			} else e = o.treeContext, ra = um(s.nextSibling), na = t, V = !0, ia = null, aa = !1, e !== null && ta(t, e), t = Bc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Ni(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Uc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Wc(e, t, n, r, i) {
		return Ca(t), n = $o(e, t, n, r, void 0, i), r = U(), e !== null && !Mc ? (rs(e, t, i), cl(e, t, i)) : (V && r && $i(t), t.flags |= 1, Nc(e, t, n, i), t.child);
	}
	function Gc(e, t, n, r, i, a) {
		return Ca(t), t.updateQueue = null, n = ts(t, r, n, i), es(e), r = U(), e !== null && !Mc ? (rs(e, t, a), cl(e, t, a)) : (V && r && $i(t), t.flags |= 1, Nc(e, t, n, a), t.child);
	}
	function Kc(e, t, n, r, i) {
		if (Ca(t), t.stateNode === null) {
			var a = ki, o = n.contextType;
			typeof o == "object" && o && (a = wa(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = vc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, mo(t), o = n.contextType, a.context = typeof o == "object" && o ? wa(o) : ki, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (_c(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && vc.enqueueReplaceState(a, a.state, null), So(t, r, a, i), xo(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = xc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ki, typeof u == "object" && u && (o = wa(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && bc(t, a, r, o), po = !1;
			var f = t.memoizedState;
			a.state = f, So(t, r, a, i), xo(), l = t.memoizedState, s || f !== l || po ? (typeof d == "function" && (_c(t, n, d, r), l = t.memoizedState), (c = po || yc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, ho(e, t), o = t.memoizedProps, u = xc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ki, typeof l == "object" && l && (c = wa(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && bc(t, a, r, c), po = !1, f = t.memoizedState, a.state = f, So(t, r, a, i), xo();
			var p = t.memoizedState;
			o !== d || f !== p || po || e !== null && e.dependencies !== null && Sa(e.dependencies) ? (typeof s == "function" && (_c(t, n, s, r), p = t.memoizedState), (u = po || yc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Sa(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Uc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = uo(t, e.child, null, i), t.child = uo(t, null, n, i)) : Nc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = cl(e, t, i), e;
	}
	function qc(e, t, n, r) {
		return da(), t.flags |= 256, Nc(e, t, n, r), t.child;
	}
	var Jc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Yc(e) {
		return {
			baseLanes: e,
			cachePool: qa()
		};
	}
	function Xc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ud), e;
	}
	function Zc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Lo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (V) {
				if (i ? Mo(t) : Fo(), (e = ra) ? (e = om(e, aa), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ji === null ? null : {
						id: Yi,
						overflow: Xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ri(e), n.return = t, t.child = n, na = t, ra = null)) : e = null, e === null) throw sa(t);
				return t.lanes = cm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Fo(), i = t.mode, a = $c({
				mode: "hidden",
				children: a
			}, i), r = Ii(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Yc(n), r.childLanes = Xc(e, o, n), t.memoizedState = Jc, Rc(null, r)) : (Mo(t), Qc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return tl(e, t, a, o, r, c, s, n);
		}
		return i ? (Fo(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Ni(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Ii(i, a, n, null), i.flags |= 2) : i = Ni(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Rc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Yc(n) : (a = i.cachePool, a === null ? a = qa() : (s = Aa._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Xc(e, o, n), t.memoizedState = Jc, Rc(e.child, r)) : (Mo(t), n = e.child, e = n.sibling, n = Ni(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Qc(e, t) {
		return t = $c({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function $c(e, t) {
		return e = ji(22, e, null, t), e.lanes = 0, e;
	}
	function el(e, t, n) {
		return uo(t, e.child, null, n), e = Qc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function tl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Mo(t), t.flags &= -257, el(e, t, c)) : t.memoizedState === null ? (Fo(), o = a.fallback, s = t.mode, a = $c({
			mode: "visible",
			children: a.children
		}, s), o = Ii(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, uo(t, e.child, null, c), a = t.child, a.memoizedState = Yc(c), a.childLanes = Xc(e, r, c), t.memoizedState = Jc, Rc(null, a)) : (Fo(), t.child = e.child, t.flags |= 128, null);
		if (Mo(t), cm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, pa({
				value: a,
				source: null,
				stack: null
			})), el(e, t, c);
		}
		if (Mc || xa(e, t, c, !1), r = (c & e.childLanes) !== 0, Mc || r) {
			if (To.current !== null) return el(e, t, c);
			if (r = $u, r !== null && (a = gt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Ei(e, a), Fd(r, e, a), jc;
			return sm(o) || qd(), el(e, t, c);
		}
		return sm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, ra = um(o.nextSibling), na = t, V = !0, ia = null, aa = !1, e !== null && ta(t, e), t = Qc(t, a.children), t.flags |= 134221824, t);
	}
	function nl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ya(e.return, t, n);
	}
	function rl(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Bo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function il(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function al(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function ol(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Lo.current;
		if (t.flags & 128) return Ro(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Ro(t, o), i === "backwards" && e !== null ? (al(e), Nc(e, t, r, n), al(e)) : Nc(e, t, r, n), r = V ? Gi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && nl(e, n, t);
			else if (e.tag === 19) nl(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = rl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, al(t)), il(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Bo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				il(t, !0, n, null, a, r);
				break;
			case "together":
				il(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = rl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), il(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function sl(e, t, n) {
		var r = t.pendingProps;
		return _a(t, t.type, r.value), Nc(e, t, r.children, n), t.child;
	}
	function cl(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), sd |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (xa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Ni(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Ni(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function ll(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Sa(e)));
	}
	function ul(e, t, n) {
		switch (t.tag) {
			case 3:
				Te(t, t.stateNode.containerInfo), _a(t, Aa, e.memoizedState.cache), da();
				break;
			case 27:
			case 5:
				De(t);
				break;
			case 4:
				Te(t, t.stateNode.containerInfo);
				break;
			case 10:
				_a(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, No(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Mo(t), t.flags |= 128, null;
					r = xa(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Zc(e, t, n) : (Mo(t), e = cl(e, t, n), e === null ? null : e.sibling);
				}
				Mo(t);
				break;
			case 19:
				if (t.flags & 128) return ol(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (xa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return ol(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Ro(t, Lo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Lc(e, t, n, t.pendingProps);
			case 24: _a(t, Aa, e.memoizedState.cache);
		}
		return cl(e, t, n);
	}
	function dl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Mc = !0;
			else {
				if (!ll(e, n) && !(t.flags & 128)) return Mc = !1, ul(e, t, n);
				Mc = !!(e.flags & 131072);
			}
		} else Mc = !1, V && t.flags & 1048576 && Qi(t, Gi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = eo(t.elementType), t.type = e, typeof e == "function") Mi(e) ? (r = xc(e, r), t.tag = 1, t = Kc(null, t, e, r, n)) : (t.tag = 0, t = Wc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === ne) {
								t.tag = 11, t = Pc(null, t, e, r, n);
								break a;
							}
							if (a === ae) {
								t.tag = 14, t = Fc(null, t, e, r, n);
								break a;
							}
							if (a === te) {
								t.tag = 10, t.type = e, t = sl(null, t, n);
								break a;
							}
						}
						throw t = me(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Wc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = xc(r, t.pendingProps), Kc(e, t, r, a, n);
			case 3:
				a: {
					if (Te(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, ho(e, t), So(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, _a(t, Aa, r), r !== o.cache && ba(t, [Aa], n, !0), xo(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = qc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Vi(Error(i(424)), t), pa(a), t = qc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (ra = um(e.firstChild), na = t, V = !0, ia = null, aa = !0, n = fo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (da(), r === a) {
							t = cl(e, t, n);
							break a;
						}
						Nc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Uc(e, t), e === null ? (n = Pm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : V || (t.stateNode = pp(t.type, t.pendingProps, Ce.current, t)) : t.memoizedState = Pm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return De(t), e === null && V && (r = t.stateNode = gm(t.type, t.pendingProps, Ce.current), na = t, aa = !0, a = ra, Cp(t.type) ? (dm = a, ra = um(r.firstChild)) : ra = a), Nc(e, t, t.pendingProps.children, n), Uc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && V && ((a = r = ra) && (r = im(r, t.type, t.pendingProps, aa), r === null ? a = !1 : (t.stateNode = r, na = t, ra = um(r.firstChild), aa = !1, a = !0)), a || sa(t)), De(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, mp(a, o) ? r = null : s !== null && mp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = $o(e, t, ns, null, null, n), ch._currentValue = a), Uc(e, t), Nc(e, t, r, n), t.child;
			case 6: return e === null && V && ((e = n = ra) && (n = am(n, t.pendingProps, aa), n === null ? e = !1 : (t.stateNode = n, na = t, ra = null, e = !0)), e || sa(t)), null;
			case 13: return Zc(e, t, n);
			case 4: return Te(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = uo(t, null, r, n) : Nc(e, t, r, n), t.child;
			case 11: return Pc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Uc(e, t), Nc(e, t, r, n), t.child;
			case 8: return Nc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Nc(e, t, t.pendingProps.children, n), t.child;
			case 10: return sl(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Ca(t), a = wa(a), r = r(a), t.flags |= 1, Nc(e, t, r, n), t.child;
			case 14: return Fc(e, t, t.type, t.pendingProps, n);
			case 15: return Ic(e, t, t.type, t.pendingProps, n);
			case 19: return ol(e, t, n);
			case 31: return Hc(e, t, n);
			case 22: return Lc(e, t, n, t.pendingProps);
			case 24: return Ca(t), r = wa(Aa), e === null ? (a = Ga(), a === null && (a = $u, o = ja(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, mo(t), _a(t, Aa, a)) : ((e.lanes & n) !== 0 && (ho(e, t), So(t, null, null, n), xo()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, _a(t, Aa, r), r !== a.cache && ba(t, [Aa], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), _a(t, Aa, r))), Nc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : V && $i(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Uc(e, t), Nc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function fl(e) {
		e.flags |= 4;
	}
	function pl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Ym(t, r) : Ym(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Wd()) e.flags |= 8192;
				else throw to = Za, Ya;
			}
		} else e.flags &= -16777217;
	}
	function ml(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Xm(t)) {
			if (Wd()) e.flags |= 8192;
			else throw to = Za, Ya;
		}
	}
	function hl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : ut(), e.lanes |= t, dd |= t);
	}
	function G(e, t) {
		if (!V) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function gl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function _l(e, t, n) {
		var r = t.pendingProps;
		switch (ea(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return gl(t), null;
			case 1: return gl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), va(Aa), Ee(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ua(t) ? fl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, fa())), gl(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (fl(t), o === null ? (gl(t), pl(t, a, null, r, n)) : (gl(t), ml(t, o))) : o ? o === e.memoizedState ? (gl(t), t.flags &= -16777217) : (fl(t), gl(t), ml(t, o)) : (e = e.memoizedProps, e !== r && fl(t), gl(t), pl(t, a, e, r, n)), null;
			case 27:
				if (Oe(t), n = Ce.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					e = xe.current, ua(t) ? ca(t, e) : (e = gm(a, r, n), t.stateNode = e, fl(t));
				}
				return gl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Oe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = xe.current, ua(t)) ca(t, o);
					else {
						var s = up(Ce.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[St] = t, o[Ct] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (rp(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && fl(t);
					}
				}
				return gl(t), t.subtreeFlags &= -33554433, pl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ce.current, ua(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = na, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[St] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || tp(e.nodeValue, n)), e || sa(t, !0);
					} else e = up(e).createTextNode(r), e[St] = t, t.stateNode = e;
				}
				return gl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = ua(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[St] = t;
						} else da(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), e = !1;
					} else n = fa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Io(t), t) : (Io(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return gl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = ua(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[St] = t;
						} else da(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), a = !1;
					} else a = fa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Io(t), t) : (Io(t), null);
				}
				return Io(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), hl(t, t.updateQueue), gl(t), null);
			case 4: return Ee(), e === null && Gf(t.stateNode.containerInfo), t.flags |= 67108864, gl(t), null;
			case 10: return va(t.type), gl(t), null;
			case 19:
				if (zo(t), r = t.memoizedState, r === null) return gl(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) G(r, !1);
					else {
						if (od !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Bo(e), o !== null) {
								for (t.flags |= 128, G(r, !1), e = o.updateQueue, t.updateQueue = e, hl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Pi(n, e), n = n.sibling;
								return Ro(t, Lo.current & 1 | 2), V && Zi(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Be() > _d && (t.flags |= 128, a = !0, G(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Bo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, hl(t, e), G(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !V) return gl(t), null;
						} else 2 * Be() - r.renderingStartTime > _d && n !== 536870912 && (t.flags |= 128, a = !0, G(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Be(), e.sibling = null, o = Lo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || V ? Ro(t, o) : (n = o, be(Ao, t), be(Lo, n), jo === null && (jo = t)), V && Zi(t, r.treeForkCount), e;
				}
				return gl(t), null;
			case 22:
			case 23: return Io(t), ko(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (gl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : gl(t), n = t.updateQueue, n !== null && hl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && ye(Wa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), va(Aa), gl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, gl(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function vl(e, t) {
		switch (ea(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return va(Aa), Ee(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Oe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Io(t), t.alternate === null) throw Error(i(340));
					da();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Io(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					da();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return zo(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ee(), null;
			case 10: return va(t.type), null;
			case 22:
			case 23: return Io(t), ko(), e !== null && ye(Wa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return va(Aa), null;
			case 25: return null;
			default: return null;
		}
	}
	function yl(e, t) {
		switch (ea(t), t.tag) {
			case 3:
				va(Aa), Ee();
				break;
			case 26:
			case 27:
			case 5:
				Oe(t);
				break;
			case 4:
				Ee();
				break;
			case 31:
				t.memoizedState !== null && Io(t);
				break;
			case 13:
				Io(t);
				break;
			case 19:
				zo(t);
				break;
			case 10:
				va(t.type);
				break;
			case 22:
			case 23:
				Io(t), ko(), e !== null && ye(Wa);
				break;
			case 24: va(Aa);
		}
	}
	function bl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			X(t, t.return, e);
		}
	}
	function xl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								X(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			X(t, t.return, e);
		}
	}
	function Sl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				wo(t, n);
			} catch (t) {
				X(e, e.return, t);
			}
		}
	}
	function Cl(e, t, n) {
		n.props = xc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			X(e, t, n);
		}
	}
	function wl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = gi(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Fp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Ip(e);
							p(e.child, !1, $p, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			X(e, t, n);
		}
	}
	function Tl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				X(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				X(e, t, n);
			}
			else n.current = null;
		}
	}
	function El(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) tm(e.stateNode, t[n]);
	}
	function Dl(e) {
		for (var t = e.return; t !== null && (Al(t) && tm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (Al(t) && nm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function kl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Al(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function jl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			X(e, e.return, t);
		}
	}
	function Ml(e, t, n) {
		try {
			var r = e.stateNode;
			ap(r, e.type, n, t), r[Ct] = t;
		} catch (t) {
			X(e, e.return, t);
		}
	}
	function Nl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Cp(e.type) || e.tag === 4;
	}
	function Pl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Nl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Cp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Fl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = vn)), El(e, r), z = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, Cp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Fl(e, t, n, r), e = e.sibling; e !== null;) Fl(e, t, n, r), e = e.sibling;
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), El(e, r), z = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, Cp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function Ll(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			rp(t, r, n), t[St] = e, t[Ct] = n;
		} catch (t) {
			X(e, e.return, t);
		}
	}
	var Rl = !1, zl = null;
	function Bl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Rl = !0);
	}
	var Vl = null;
	function Hl() {
		var e = Vl;
		return Vl = null, e;
	}
	var Ul = 0;
	function Wl(e, t, n, r, i) {
		return Ul = 0, Gl(e.child, t, n, r, i);
	}
	function Gl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = kp(o);
					r.push(s), s.view && (a = !0);
				} else a || kp(o).view && (a = !0);
				Rl = !0, Ep(o, Ul === 0 ? t : t + "_" + Ul, n), Ul++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Gl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Kl(e, t) {
		for (; e !== null;) e.tag === 5 ? Dp(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Kl(e.child, t)), e = e.sibling;
	}
	function ql(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (ql(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = vi(t.default, t.share), t !== "none" && (Wl(e, n, t, null, !1) || Kl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Jl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = gi(r, n), a = vi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? ql(e) : Wl(e, i, a, null, !1) ? (ql(e), n.paired || t || Pd(e, r.onEnter)) : Kl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Jl(e, t), e = e.sibling;
		else ql(e);
	}
	function Yl(e) {
		if (zl !== null && zl.size !== 0) {
			var t = zl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = vi(n.default, n.share);
								if (a !== "none" && (Wl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Pd(e, n.onShare)) : Kl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Yl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Xl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = gi(t, e.stateNode), r = zl === null ? void 0 : zl.get(n), i = vi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Wl(e, n, i, null, !1) ? r === void 0 ? Pd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, zl.delete(n), Pd(e, t.onShare)) : Kl(e.child, !1)), zl !== null && Yl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Xl(e), e = e.sibling;
		else zl !== null && Yl(e);
	}
	function Zl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = gi(t, e.stateNode);
				t = vi(t.default, t.update), e.flags &= -5, t !== "none" && Wl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Zl(e);
			e = e.sibling;
		}
	}
	function Ql(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Kl(e.child, !1));
				}
				Ql(e);
			}
			e = e.sibling;
		}
	}
	function $l(e) {
		if (e.tag === 30) e.stateNode.paired = null, Kl(e.child, !1), Ql(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) $l(e), e = e.sibling;
		else Ql(e);
	}
	function eu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Kl(e.child, !1) : e.subtreeFlags & 33554432 && eu(e), e = e.sibling;
	}
	function tu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Ul < a.length) {
					var l = a[Ul], u = kp(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Ep(c, Ul === 0 ? n : n + "_" + Ul, i), s && e.flags & 4 || (Vl === null && (Vl = []), Vl.push(c, Ul === 0 ? r : r + "_" + Ul, t.memoizedProps)), Ul++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : tu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function nu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = gi(n, r), a = vi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(Ap);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Ul = 0, i = tu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Pd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && nu(e, t);
			e = e.sibling;
		}
	}
	var ru = !1, K = !1, iu = !1, au = !1, ou = typeof WeakSet == "function" ? WeakSet : Set, su = null, cu = !1, lu = !1, uu = !1, du = !1;
	function fu(e, t, n) {
		if (e = e.containerInfo, cp = _h, e = qr(e), Jr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (lp = {
			focusedElem: e,
			selectionRange: r
		}, _h = !1, n = (n & 335544064) === n, su = t, t = n ? 9270 : 1024; su !== null;) {
			if (e = su, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Xl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Bl(e), pu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Xl(r), pu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Bl(e), pu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, su = r) : (n && Zl(e), pu(n));
			}
		}
		zl = null;
	}
	function pu(e) {
		for (; su !== null;) {
			var t = su, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = xc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							X(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) rm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								rm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = gi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = vi(a.default, a.update), a !== "none" && Wl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, su = r;
				break;
			}
			su = t.return;
		}
	}
	function mu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Pu(e, n), r & 4 && bl(5, n);
				break;
			case 1:
				if (Pu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						X(n, n.return, e);
					}
					else {
						var i = xc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							X(n, n.return, e);
						}
					}
				}
				r & 64 && Sl(n), r & 512 && wl(n, n.return);
				break;
			case 3:
				if (Pu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						wo(e, t);
					} catch (e) {
						X(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Ll(n);
			case 26:
			case 5:
				Pu(e, n), t === null && r & 4 && jl(n), r & 512 && wl(n, n.return);
				break;
			case 12:
				Pu(e, n);
				break;
			case 31:
				Pu(e, n), r & 4 && Cu(e, n);
				break;
			case 13:
				Pu(e, n), r & 4 && wu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = vf.bind(null, n), lm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || ru, !r) {
					var a = t !== null && t.memoizedState !== null || K;
					t = ru, i = K, ru = r, (K = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Iu(e, n, r)) : Pu(e, n), ru = t, K = i;
				}
				break;
			case 30:
				Pu(e, n), r & 512 && wl(n, n.return);
				break;
			case 7: r & 512 && wl(n, n.return);
			default: Pu(e, n);
		}
	}
	function hu(e, t) {
		for (e = e.child; e !== null;) gu(e, t), e = e.sibling;
	}
	function gu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					X(e, e.return, t);
				}
				_u(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, z = !0;
				} catch (t) {
					X(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Tp(s, !0) : Tp(e.stateNode, !1);
				} catch (t) {
					X(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && hu(e, t);
				break;
			default: hu(e, t);
		}
	}
	function _u(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						gu(n, r);
						break a;
					case 22:
						n.memoizedState === null && _u(n, r);
						break a;
					default: _u(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function vu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, vu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && jt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var yu = null, bu = !1;
	function xu(e, t, n) {
		for (n = n.child; n !== null;) Su(e, t, n), n = n.sibling;
	}
	function Su(e, t, n) {
		if (Xe && typeof Xe.onCommitFiberUnmount == "function") try {
			Xe.onCommitFiberUnmount(Ye, n);
		} catch {}
		switch (n.tag) {
			case 26:
				K || Tl(n, t), xu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !K && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				K || Tl(n, t), Ol(n);
				var r = yu, i = bu;
				Cp(n.type) && (yu = n.stateNode, bu = !1), xu(e, t, n), _m(n.stateNode, n.type, n.memoizedProps), yu = r, bu = i;
				break;
			case 5: K || Tl(n, t), Ol(n);
			case 6:
				if (n.tag === 6 && Ol(n), r = yu, i = bu, yu = null, xu(e, t, n), yu = r, bu = i, yu !== null) {
					if (bu) try {
						(yu.nodeType === 9 ? yu.body : yu.nodeName === "HTML" ? yu.ownerDocument.body : yu).removeChild(n.stateNode), z = !0;
					} catch (e) {
						X(n, t, e);
					}
					else try {
						yu.removeChild(n.stateNode), z = !0;
					} catch (e) {
						X(n, t, e);
					}
				}
				break;
			case 18:
				yu !== null && (bu ? (e = yu, wp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Uh(e)) : wp(yu, n.stateNode));
				break;
			case 4:
				r = yu, i = bu, yu = n.stateNode.containerInfo, bu = !0, xu(e, t, n), yu = r, bu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				xl(2, n, t), K || xl(4, n, t), xu(e, t, n);
				break;
			case 1:
				K || (Tl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Cl(n, t, r)), xu(e, t, n);
				break;
			case 21:
				xu(e, t, n);
				break;
			case 22:
				K = (r = K) || n.memoizedState !== null, xu(e, t, n), K = r;
				break;
			case 30:
				Tl(n, t), xu(e, t, n);
				break;
			case 7:
				K || Tl(n, t), xu(e, t, n);
				break;
			default: xu(e, t, n);
		}
	}
	function Cu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Uh(e);
			} catch (e) {
				X(t, t.return, e);
			}
		}
	}
	function wu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Uh(e);
		} catch (e) {
			X(t, t.return, e);
		}
	}
	function Tu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new ou()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new ou()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Eu(e, t) {
		var n = Tu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = yf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Du(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Cp(l.type)) {
							yu = l.stateNode, bu = !1;
							break a;
						}
						break;
					case 5:
						yu = l.stateNode, bu = !1;
						break a;
					case 3:
					case 4:
						yu = l.stateNode.containerInfo, bu = !0;
						break a;
				}
				l = l.return;
			}
			if (yu === null) throw Error(i(160));
			Su(s, c, o), yu = null, bu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) ku(t, e, n), t = t.sibling;
	}
	var Ou = null;
	function ku(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Du(t, e, n), Au(e), a & 4 && (xl(3, e, e.return), bl(3, e), xl(5, e, e.return));
				break;
			case 1:
				Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), a & 64 && ru && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Ou, Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (ru) e.stateNode = pp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[kt] || r[St] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), rp(r, t, n), r[St] = e, It(r), t = r;
												break a;
											case "link":
												if (o = Km("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), rp(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Km("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), rp(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[St] = e, It(r), t = r;
									}
									e.stateNode = t;
								}
							} else ru || qm(o, e.type, e.stateNode);
						} else e.stateNode = Vm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Ml(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || K || t.parentNode.removeChild(t)) : a.count--, n === null ? ru || qm(o, e.type, e.stateNode) : Vm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), r !== null && a & 4 && Ml(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = iu, iu = !1, Du(t, e, n), iu = o, Au(e), a & 512 && (K || r === null || Tl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						un(t, ""), z = !0;
					} catch (t) {
						X(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Ml(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (au = !0);
				break;
			case 6:
				if (Du(t, e, n), Au(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, z = !0;
					} catch (t) {
						X(e, e.return, t);
					}
				}
				break;
			case 3:
				if (z = !1, Gm = null, o = Ou, Ou = xm(t.containerInfo), Du(t, e, n), Ou = o, Au(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Uh(t.containerInfo);
				} catch (t) {
					X(e, e.return, t);
				}
				au && (au = !1, ju(e)), z = !1;
				break;
			case 4:
				a = iu, iu = ru, r = Kt(), o = Ou, Ou = xm(e.stateNode.containerInfo), Du(t, e, n), Au(e), Ou = o, z && lu && (uu = !0), z = r, iu = a;
				break;
			case 12:
				Du(t, e, n), Au(e);
				break;
			case 31:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 13:
				Du(t, e, n), Au(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (hd = Be()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = ru, l = K, u = iu;
				ru = c || o, iu = u || o, K = l || s, Du(t, e, n), K = l, iu = u, ru = c, Au(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || ru || K || (t = s || K, n = ru, r = K, ru = o || ru, K = t, Fu(e, 2), ru = n, K = r), !o && iu || hu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Eu(e, n))));
				break;
			case 19:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 30:
				a & 512 && (K || r === null || Tl(r, r.return)), a = Kt(), o = lu, s = (n & 335544064) === n, c = e.memoizedProps, lu = s && vi(c.default, c.update) !== "none", Du(t, e, n), Au(e), s && r !== null && z && (e.flags |= 4), lu = o, z = a;
				break;
			case 21: break;
			case 7: a & 512 && (K || r === null || Tl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Du(t, e, n), Au(e);
		}
	}
	function Au(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Nl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Al(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (kl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Il(e, Pl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (un(l, ""), n.flags &= -33), Il(e, Pl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Fl(e, Pl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				X(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function ju(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			ju(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, _h = !0, t.reset(), _h = !1), e = e.sibling;
		}
	}
	function Mu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Nu(t, e), t = t.sibling;
		else nu(t, !1);
	}
	function Nu(e, t) {
		var n = e.alternate;
		if (n === null) Jl(e, !1);
		else switch (e.tag) {
			case 3:
				if (du = cu = !1, Hl(), Mu(t, e), !cu && !uu) {
					if (e = Vl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Dp(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), du = !0;
				}
				Vl = null;
				break;
			case 5:
				Mu(t, e);
				break;
			case 4:
				r = cu, cu = !1, Mu(t, e), cu && (uu = !0), cu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Mu(t, e) : Jl(e, !1));
				break;
			case 30:
				r = cu, i = Hl(), cu = !1, Mu(t, e), cu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = gi(a, o), o = gi(n.memoizedProps, o);
				var s = vi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Ul = 0, t = tu(e, n, t, o, s, a, !0), Ul !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Pd(e, e.memoizedProps.onUpdate), Vl = i) : i !== null && (i.push.apply(i, Vl), Vl = i), cu = e.flags & 32 ? !0 : r;
				break;
			default: Mu(t, e);
		}
	}
	function Pu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) mu(e, t.alternate, t), t = t.sibling;
	}
	function Fu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					xl(4, n, n.return), Fu(n, r);
					break;
				case 1:
					Tl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Cl(n, n.return, i), Fu(n, r);
					break;
				case 27: r & 2 && _m(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Tl(n, n.return), n.tag !== 5 && n.tag !== 27 || Ol(n), Fu(n, r);
					break;
				case 6:
					Ol(n);
					break;
				case 26:
					Tl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || K || i.parentNode.removeChild(i), Fu(n, r);
					break;
				case 22:
					n.memoizedState === null && Fu(n, r);
					break;
				case 30:
					Tl(n, n.return), Fu(n, r);
					break;
				case 7: Tl(n, n.return);
				default: Fu(n, r);
			}
			e = e.sibling;
		}
	}
	function Iu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Iu(i, a, n), bl(4, a);
					break;
				case 1:
					if (Iu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						X(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) Co(l[i], c);
						} catch (e) {
							X(r, r.return, e);
						}
					}
					s && o & 64 && Sl(a), wl(a, a.return);
					break;
				case 27: n & 2 && Ll(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Dl(a), Iu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 6:
					Dl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || ru || qm(xm(c.ownerDocument), a.type, c), Iu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 12:
					Iu(i, a, n);
					break;
				case 31:
					Iu(i, a, n), s && o & 4 && Cu(i, a);
					break;
				case 13:
					Iu(i, a, n), s && o & 4 && wu(i, a);
					break;
				case 22:
					a.memoizedState === null && Iu(i, a, n), wl(a, a.return);
					break;
				case 30:
					Iu(i, a, n), wl(a, a.return);
					break;
				case 7: wl(a, a.return);
				default: Iu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function q(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Ma(n));
	}
	function Lu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ma(e));
	}
	function Ru(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) zu(e, t, n, r), t = t.sibling;
		else i && eu(t);
	}
	function zu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && $l(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Ru(e, t, n, r), a & 2048 && bl(9, t);
				break;
			case 1:
				Ru(e, t, n, r);
				break;
			case 3:
				Ru(e, t, n, r), i && du && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Ma(a)));
				break;
			case 12:
				if (a & 2048) {
					Ru(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						X(t, t.return, e);
					}
				} else Ru(e, t, n, r);
				break;
			case 31:
				Ru(e, t, n, r);
				break;
			case 13:
				Ru(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && $l(t), o._visibility & 2 ? Ru(e, t, n, r) : (o._visibility |= 2, Bu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && $l(s), o._visibility & 2 ? Ru(e, t, n, r) : Vu(e, t)), a & 2048 && q(s, t);
				break;
			case 24:
				Ru(e, t, n, r), a & 2048 && Lu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Kl(a.child, !0), Kl(t.child, !0))), Ru(e, t, n, r);
				break;
			default: Ru(e, t, n, r);
		}
	}
	function Bu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Bu(a, o, s, c, i), bl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Bu(a, o, s, c, i)) : u._visibility & 2 ? Bu(a, o, s, c, i) : Vu(a, o), i && l & 2048 && q(o.alternate, o);
					break;
				case 24:
					Bu(a, o, s, c, i), i && l & 2048 && Lu(o.alternate, o);
					break;
				default: Bu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Vu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Vu(n, r), i & 2048 && q(r.alternate, r);
					break;
				case 24:
					Vu(n, r), i & 2048 && Lu(r.alternate, r);
					break;
				default: Vu(n, r);
			}
			t = t.sibling;
		}
	}
	var Hu = 8192;
	function Uu(e, t, n) {
		if (e.subtreeFlags & Hu) for (e = e.child; e !== null;) Wu(e, t, n), e = e.sibling;
	}
	function Wu(e, t, n) {
		switch (e.tag) {
			case 26:
				Uu(e, t, n), e.flags & Hu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Qm(n, e)) : $m(n, Ou, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Uu(e, t, n), e.flags & Hu && (e = e.stateNode, (t & 335544128) === t && Qm(n, e));
				break;
			case 3:
			case 4:
				var r = Ou;
				Ou = xm(e.stateNode.containerInfo), Uu(e, t, n), Ou = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Hu, Hu = 16777216, Uu(e, t, n), Hu = r) : Uu(e, t, n));
				break;
			case 30:
				if ((e.flags & Hu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, zl === null && (zl = /* @__PURE__ */ new Map()), zl.set(r, i);
				}
				Uu(e, t, n);
				break;
			default: Uu(e, t, n);
		}
	}
	function Gu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ku(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Yu(r, e);
			}
			Gu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) qu(e), e = e.sibling;
	}
	function qu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ku(e), e.flags & 2048 && xl(9, e, e.return);
				break;
			case 3:
				Ku(e);
				break;
			case 12:
				Ku(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ju(e)) : Ku(e);
				break;
			default: Ku(e);
		}
	}
	function Ju(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Yu(r, e);
			}
			Gu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, t, t.return), Ju(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ju(t));
					break;
				default: Ju(t);
			}
			e = e.sibling;
		}
	}
	function Yu(e, t) {
		for (; su !== null;) {
			var n = su;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Ma(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, su = r;
			else a: for (n = e; su !== null;) {
				r = su;
				var i = r.sibling, a = r.return;
				if (vu(r), r === n) {
					su = null;
					break a;
				}
				if (i !== null) {
					i.return = a, su = i;
					break a;
				}
				su = a;
			}
		}
	}
	var Xu = {
		getCacheForType: function(e) {
			var t = wa(Aa), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return wa(Aa).controller.signal;
		}
	}, Zu = typeof WeakMap == "function" ? WeakMap : Map, Qu = 0, $u = null, J = null, Y = 0, ed = 0, td = null, nd = !1, rd = !1, id = !1, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = 0, fd = null, pd = null, md = !1, hd = 0, gd = 0, _d = Infinity, vd = null, yd = null, bd = 0, xd = null, Sd = null, Cd = 0, wd = 0, Td = null, Ed = null, Dd = null, Od = null, kd = null, Ad = 0, jd = null;
	function Md() {
		return Qu & 2 && Y !== 0 ? Y & -Y : F.T === null ? yt() : Ff();
	}
	function Nd() {
		if (ud === 0) {
			if (!(Y & 536870912) || V) {
				var e = rt;
				rt <<= 1, !(rt & 3932160) && (rt = 262144), ud = e;
			} else ud = 536870912;
		}
		return e = Ao.current, e !== null && (e.flags |= 32), ud;
	}
	function Pd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Fp(gi(e.memoizedProps, n))), Od === null && (Od = []), Od.push(t.bind(null, r));
		}
	}
	function Fd(e, t, n) {
		(e === $u && (ed === 2 || ed === 9) || e.cancelPendingCommit !== null) && (Hd(e, 0), zd(e, Y, ud, !1)), ft(e, n), (!(Qu & 2) || e !== $u) && (e === $u && (!(Qu & 2) && (cd |= n), od === 4 && zd(e, Y, ud, !1)), Df(e));
	}
	function Id(e, t, n) {
		if (Qu & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || st(e, t), a = r ? Xd(e, t) : Jd(e, t, !0), o = r;
		do {
			if (a === 0) {
				rd && !r && zd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Rd(n)) a = Jd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = fd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Hd(c, s).flags |= 256), s = Jd(c, s, !1), s !== 2 && s !== 6) {
								if (id && !l) {
									c.errorRecoveryDisabledLanes |= o, cd |= o, a = 4;
									break a;
								}
								o = pd, pd = a, o !== null && (pd === null ? pd = o : pd.push.apply(pd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Hd(e, 0), zd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							zd(r, t, ud, !nd);
							break a;
						case 2:
							pd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = hd + 300 - Be(), 10 < a)) {
						if (zd(r, t, ud, !nd), ot(r, 0, !0) !== 0) break a;
						Cd = t, r.timeoutHandle = _p(Ld.bind(null, r, n, pd, vd, md, t, ud, cd, dd, nd, o, "Throttled", -0, 0), a);
						break a;
					}
					Ld(r, n, pd, vd, md, t, ud, cd, dd, nd, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Df(e);
	}
	function Ld(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: vn
		}, zl = null, Wu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = rh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? hd - Be() : (a & 4194048) === a ? gd - Be() : 0, m = th(d, m), m !== null) ? (Cd = a, e.cancelPendingCommit = m(rf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), zd(e, a, o, !l)) : rf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Rd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Vr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function zd(e, t, n, r) {
		t = ct(e, t), t &= ~ld, t &= ~cd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Qe(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && mt(e, n, t);
	}
	function Bd() {
		return Qu & 6 ? !0 : (Of(0, !1), !1);
	}
	function Vd() {
		if (J !== null) {
			if (ed === 0) var e = J.return;
			else e = J, ga = ha = null, is(e), io = null, ao = 0, e = J;
			for (; e !== null;) yl(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Hd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, vp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Cd = 0, Vd(), $u = e, J = n = Ni(e.current, null), Y = t, ed = 0, td = null, nd = !1, rd = st(e, t), id = !1, dd = ud = ld = cd = sd = od = 0, pd = fd = null, md = !1, ad = ct(e, t), Ci(), n;
	}
	function Ud(e, t) {
		H = null, F.H = pc, t === Ja || t === Xa ? (t = no(), ed = 3) : t === Ya ? (t = no(), ed = 4) : ed = t === jc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, td = t, J === null && (od = 1, Tc(e, Vi(t, e.current)));
	}
	function Wd() {
		var e = Ao.current;
		return e === null ? !0 : (Y & 4194048) === Y ? jo === null : (Y & 62914560) === Y || Y & 536870912 ? e === jo : !1;
	}
	function Gd() {
		var e = F.H;
		return F.H = pc, e === null ? pc : e;
	}
	function Kd() {
		var e = F.A;
		return F.A = Xu, e;
	}
	function qd() {
		od = 4, nd || (Y & 4194048) !== Y && Ao.current !== null || (rd = !0), !(sd & 134217727) && !(cd & 134217727) || $u === null || zd($u, Y, ud, !1);
	}
	function Jd(e, t, n) {
		var r = Qu;
		Qu |= 2;
		var i = Gd(), a = Kd();
		($u !== e || Y !== t) && (vd = null, Hd(e, t)), t = !1;
		var o = od;
		a: do
			try {
				if (ed !== 0 && J !== null) {
					var s = J, c = td;
					switch (ed) {
						case 8:
							Vd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Ao.current === null && (t = !0);
							var l = ed;
							if (ed = 0, td = null, ef(e, s, c, l), n && rd) {
								o = 0;
								break a;
							}
							break;
						default: l = ed, ed = 0, td = null, ef(e, s, c, l);
					}
				}
				Yd(), o = od;
				break;
			} catch (t) {
				Ud(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, ga = ha = null, Qu = r, F.H = i, F.A = a, J === null && ($u = null, Y = 0, Ci()), o;
	}
	function Yd() {
		for (; J !== null;) Qd(J);
	}
	function Xd(e, t) {
		var n = Qu;
		Qu |= 2;
		var r = Gd(), a = Kd();
		$u !== e || Y !== t ? (vd = null, _d = Be() + 500, Hd(e, t)) : rd = st(e, t);
		a: do
			try {
				if (ed !== 0 && J !== null) {
					t = J;
					var o = td;
					b: switch (ed) {
						case 1:
							ed = 0, td = null, ef(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (Qa(o)) {
								ed = 0, td = null, $d(t);
								break;
							}
							t = function() {
								ed !== 2 && ed !== 9 || $u !== e || (ed = 7), Df(e);
							}, o.then(t, t);
							break a;
						case 3:
							ed = 7;
							break a;
						case 4:
							ed = 5;
							break a;
						case 7:
							Qa(o) ? (ed = 0, td = null, $d(t)) : (ed = 0, td = null, ef(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Xm(s) : c.stateNode.complete) {
										ed = 0, td = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, tf(u));
										}
										break b;
									}
							}
							ed = 0, td = null, ef(e, t, o, 5);
							break;
						case 6:
							ed = 0, td = null, ef(e, t, o, 6);
							break;
						case 8:
							Vd(), od = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Zd();
				break;
			} catch (t) {
				Ud(e, t);
			}
		while (1);
		return ga = ha = null, F.H = r, F.A = a, Qu = n, J === null ? ($u = null, Y = 0, Ci(), od) : 0;
	}
	function Zd() {
		for (; J !== null && !Re();) Qd(J);
	}
	function Qd(e) {
		var t = dl(e.alternate, e, ad);
		e.memoizedProps = e.pendingProps, t === null ? tf(e) : J = t;
	}
	function $d(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Gc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = Gc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5:
				is(t);
				var r = t;
				r === na && (V ? (la(r), r.tag === 5 && r.stateNode != null && (ra = r.stateNode)) : (la(r), V = !0));
			default: yl(n, t), t = J = Pi(t, ad), t = dl(n, t, ad);
		}
		e.memoizedProps = e.pendingProps, t === null ? tf(e) : J = t;
	}
	function ef(e, t, n, r) {
		ga = ha = null, is(t), io = null, ao = 0;
		var i = t.return;
		try {
			if (Ac(e, i, t, n, Y)) {
				od = 1, Tc(e, Vi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			od = 1, Tc(e, Vi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (V || r === 1 ? e = !0 : rd || Y & 536870912 ? e = !1 : (nd = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ao.current, r !== null && r.tag === 13 && (r.flags |= 16384))), nf(t, e)) : tf(t);
	}
	function tf(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				nf(t, nd);
				return;
			}
			e = t.return;
			var n = _l(t.alternate, t, ad);
			if (n !== null) {
				J = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				J = t;
				return;
			}
			J = t = e;
		} while (t !== null);
		od === 0 && (od = 5);
	}
	function nf(e, t) {
		do {
			var n = vl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, J = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				J = e;
				return;
			}
			J = e = n;
		} while (e !== null);
		od = 6, J = null;
	}
	function rf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			ff();
		while (bd !== 0);
		if (Qu & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === $u && (J = $u = null, Y = 0), Sd = t, xd = e, Cd = n, Td = a, Ed = r, af(e, t, n, s, c, l, f);
		}
	}
	function af(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (wd = s, s |= Si, pt(e, n, s, r, i, a), Od = null, (n & 335544064) === n ? (kd = Fa(e), r = 10262) : (kd = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, bf(We, function() {
			return pf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Rl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = F.T, F.T = null, i = I.p, I.p = 2, a = Qu, Qu |= 4;
			try {
				fu(e, t, n);
			} finally {
				Qu = a, I.p = i, F.T = r;
			}
		}
		bd = 1, Rl ? Dd = Np(o, e.containerInfo, kd, cf, lf, sf, uf, pf, of, null, null) : (cf(), lf(), uf());
	}
	function of(e) {
		if (bd !== 0) {
			var t = xd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function sf() {
		bd === 3 && (bd = 0, Nu(Sd, xd), bd = 4);
	}
	function cf() {
		if (bd === 1) {
			bd = 0;
			var e = xd, t = Sd, n = Cd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = F.T, F.T = null;
				var i = I.p;
				I.p = 2;
				var a = Qu;
				Qu |= 4;
				try {
					lu = uu = !1, ku(t, e, n), n = lp;
					var o = qr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Kr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Jr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Gr(s, h), v = Gr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					_h = !!cp, lp = cp = null;
				} finally {
					Qu = a, I.p = i, F.T = r;
				}
			}
			e.current = t, bd = 2;
		}
	}
	function lf() {
		if (bd === 2) {
			bd = 0;
			var e = xd, t = Sd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = F.T, F.T = null;
				var r = I.p;
				I.p = 2;
				var i = Qu;
				Qu |= 4;
				try {
					mu(e, t.alternate, t);
				} finally {
					Qu = i, I.p = r, F.T = n;
				}
			}
			bd = 3;
		}
	}
	function uf() {
		if (bd === 4 || bd === 3) {
			bd = 0;
			var e = Dd;
			Dd = null, ze();
			var t = xd, n = Sd, r = Cd, i = Ed, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? bd = 5 : (bd = 0, Sd = xd = null, df(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (yd = null), vt(r), n = n.stateNode, Xe && typeof Xe.onCommitFiberRoot == "function") try {
				Xe.onCommitFiberRoot(Ye, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = F.T, a = I.p, I.p = 2, F.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					F.T = n, I.p = a;
				}
			}
			if (i = Od, o = kd, kd = null, i !== null && (Od = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Cd & 3 && ff(), Df(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === jd ? Ad++ : (Ad = 0, jd = t) : (Ad = 0, jd = null), Of(0, !1);
		}
	}
	function df(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Ma(t)));
	}
	function ff() {
		return Dd !== null && (Dd.skipTransition(), Dd = null), cf(), lf(), uf(), pf();
	}
	function pf() {
		if (bd !== 5) return !1;
		var e = xd, t = wd;
		wd = 0;
		var n = vt(Cd), r = F.T, a = I.p;
		try {
			I.p = 32 > n ? 32 : n, F.T = null, n = Td, Td = null;
			var o = xd, s = Cd;
			if (bd = 0, Sd = xd = null, Cd = 0, Qu & 6) throw Error(i(331));
			var c = Qu;
			if (Qu |= 4, qu(o.current), zu(o, o.current, s, n), Qu = c, Of(0, !1), Xe && typeof Xe.onPostCommitFiberRoot == "function") try {
				Xe.onPostCommitFiberRoot(Ye, o);
			} catch {}
			return !0;
		} finally {
			I.p = a, F.T = r, df(e, t);
		}
	}
	function mf(e, t, n) {
		t = Vi(n, t), t = Dc(e.stateNode, t, 2), e = _o(e, t, 2), e !== null && (ft(e, 2), Df(e));
	}
	function X(e, t, n) {
		if (e.tag === 3) mf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				mf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (yd === null || !yd.has(r))) {
					e = Vi(n, e), n = Oc(2), r = _o(t, n, 2), r !== null && (kc(n, r, t, e), ft(r, 2), Df(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Zu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (id = !0, i.add(n), e = gf.bind(null, e, t, n), t.then(e, e));
	}
	function gf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, $u === e && (Y & n) === n && (od === 4 || od === 3 && (Y & 62914560) === Y && 300 > Be() - hd ? Qu & 2 ? ld |= n : Hd(e, 0) : ld |= n, dd === Y && (dd = 0)), Df(e);
	}
	function _f(e, t) {
		t === 0 && (t = ut()), e = Ei(e, t), e !== null && (ft(e, t), Df(e));
	}
	function vf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), _f(e, n);
	}
	function yf(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), _f(e, n);
	}
	function bf(e, t) {
		return Ie(e, t);
	}
	var xf = null, Sf = null, Cf = !1, wf = !1, Tf = !1, Ef = 0;
	function Df(e) {
		e !== Sf && e.next === null && (Sf === null ? xf = Sf = e : Sf = Sf.next = e), wf = !0, Cf || (Cf = !0, Pf());
	}
	function Of(e, t) {
		if (!Tf && wf) {
			Tf = !0;
			do
				for (var n = !1, r = xf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - Qe(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Nf(r, a));
						} else a = Y, a = ot(r, r === $u ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || st(r, a) || (n = !0, Nf(r, a));
					}
					r = r.next;
				}
			while (n);
			Tf = !1;
		}
	}
	function kf() {
		Af();
	}
	function Af() {
		wf = Cf = !1;
		var e = 0;
		Ef !== 0 && gp() && (e = Ef);
		for (var t = Be(), n = null, r = xf; r !== null;) {
			var i = r.next, a = jf(r, t);
			a === 0 ? (r.next = null, n === null ? xf = i : n.next = i, i === null && (Sf = n)) : (n = r, (e !== 0 || a & 3) && (wf = !0)), r = i;
		}
		bd !== 0 && bd !== 5 || Of(e, !1), Ef !== 0 && (Ef = 0);
	}
	function jf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Qe(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = lt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = $u, n = Y, n = ot(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (ed === 2 || ed === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Le(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || st(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Le(r), vt(n)) {
				case 2:
				case 8:
					n = Ue;
					break;
				case 32:
					n = We;
					break;
				case 268435456:
					n = Ke;
					break;
				default: n = We;
			}
			return r = Mf.bind(null, e), n = Ie(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Le(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Mf(e, t) {
		if (bd !== 0 && bd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (ff() && e.callbackNode !== n) return null;
		var r = Y;
		return r = ot(e, e === $u ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Id(e, r, t), jf(e, Be()), e.callbackNode != null && e.callbackNode === n ? Mf.bind(null, e) : null);
	}
	function Nf(e, t) {
		if (ff()) return null;
		Id(e, t, !0);
	}
	function Pf() {
		xp(function() {
			Qu & 6 ? Ie(He, kf) : Af();
		});
	}
	function Ff() {
		if (Ef === 0) {
			var e = Ra;
			e === 0 && (e = nt, nt <<= 1, !(nt & 261888) && (nt = 256)), Ef = e;
		}
		return Ef;
	}
	function If(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : _n(e);
	}
	function Lf(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = If((i[Ct] || null).action), o = r.submitter;
			o && (t = (t = o[Ct] || null) ? If(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new zn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Ef !== 0) {
								var e = new FormData(i, o);
								$s(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), $s(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var Rf = 0; Rf < pi.length; Rf++) {
		var zf = pi[Rf];
		mi(zf.toLowerCase(), "on" + (zf[0].toUpperCase() + zf.slice(1)));
	}
	mi(oi, "onAnimationEnd"), mi(B, "onAnimationIteration"), mi(si, "onAnimationStart"), mi("dblclick", "onDoubleClick"), mi("focusin", "onFocus"), mi("focusout", "onBlur"), mi(ci, "onTransitionRun"), mi(li, "onTransitionStart"), mi(ui, "onTransitionCancel"), mi(di, "onTransitionEnd"), Vt("onMouseEnter", ["mouseout", "mouseover"]), Vt("onMouseLeave", ["mouseout", "mouseover"]), Vt("onPointerEnter", ["pointerout", "pointerover"]), Vt("onPointerLeave", ["pointerout", "pointerover"]), Bt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Bt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Bt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Bt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Bt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Bt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Bf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Vf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Bf));
	function Hf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						yi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						yi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Z(e, t) {
		var n = t[Tt];
		n === void 0 && (n = t[Tt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Kf(t, e, 2, !1), n.add(r));
	}
	function Uf(e, t, n) {
		var r = 0;
		t && (r |= 4), Kf(n, e, r, t);
	}
	var Wf = "_reactListening" + Math.random().toString(36).slice(2);
	function Gf(e) {
		if (!e[Wf]) {
			e[Wf] = !0, Rt.forEach(function(t) {
				t !== "selectionchange" && (Vf.has(t) || Uf(t, !1, e), Uf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Wf] || (t[Wf] = !0, Uf("selectionchange", !1, t));
		}
	}
	function Kf(e, t, n, r) {
		switch (wh(t)) {
			case 2:
				var i = vh;
				break;
			case 8:
				i = yh;
				break;
			default: i = bh;
		}
		n = i.bind(null, t, n, e), i = void 0, !On || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function qf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = Mt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Tn(function() {
			var r = a, i = bn(n), s = [];
			a: {
				var c = fi.get(e);
				if (c !== void 0) {
					var l = zn, u = e;
					switch (e) {
						case "keypress": if (Pn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = rr;
							break;
						case "focusin":
							u = "focus", l = Jn;
							break;
						case "focusout":
							u = "blur", l = Jn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Jn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = Kn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = qn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = or;
							break;
						case oi:
						case B:
						case si:
							l = Yn;
							break;
						case di:
							l = sr;
							break;
						case "scroll":
						case "scrollend":
							l = Vn;
							break;
						case "wheel":
							l = cr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = Xn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = ir;
							break;
						case "submit":
							l = ar;
							break;
						case "toggle":
						case "beforetoggle": l = lr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = En(m, p), g != null && d.push(Jf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== yn && (u = n.relatedTarget || n.fromElement) && (Mt(u) || u[wt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Mt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Kn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = ir, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Pt(c), h = l == null ? u : Pt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, Mt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Xf) : null, c !== null && Zf(s, u, c, d, !1), l !== null && f !== null && Zf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Pt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = kr;
					else if (Cr(c)) {
						if (Ar) _ = zr;
						else {
							_ = Lr;
							var v = Ir;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && mn(r.elementType) && (_ = kr) : _ = Rr;
					if (_ &&= _(e, r)) {
						wr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Pt(r) : window, e) {
					case "focusin":
						(Cr(v) || v.contentEditable === "true") && (Xr = v, Zr = r, Qr = null);
						break;
					case "focusout":
						Qr = Zr = Xr = null;
						break;
					case "mousedown":
						$r = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						$r = !1, ei(s, n, i);
						break;
					case "selectionchange": if (Yr) break;
					case "keydown":
					case "keyup": ei(s, n, i);
				}
				var y;
				if (dr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else yr ? _r(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (mr && n.locale !== "ko" && (yr || b !== "onCompositionStart" ? b === "onCompositionEnd" && yr && (y = Nn()) : (An = i, jn = "value" in An ? An.value : An.textContent, yr = !0)), v = Yf(r, b), 0 < v.length && (b = new Zn(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = vr(n), y !== null && (b.data = y)))), (y = pr ? br(e, n) : xr(e, n)) && (b = Yf(r, "onBeforeInput"), 0 < b.length && (v = new Zn("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), Lf(s, e, r, n, i);
			}
			Hf(s, t);
		});
	}
	function Jf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Yf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = En(e, n), i != null && r.unshift(Jf(e, i, a)), i = En(e, t), i != null && r.push(Jf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Xf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Zf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = En(n, a), l != null && o.unshift(Jf(n, l, c))) : i || (l = En(n, a), l != null && o.push(Jf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Qf = /\r\n?/g, $f = /\u0000|\uFFFD/g;
	function ep(e) {
		return (typeof e == "string" ? e : "" + e).replace(Qf, "\n").replace($f, "");
	}
	function tp(e, t) {
		return t = ep(t), ep(e) === t;
	}
	function Q(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || un(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && un(e, "" + r);
				else return;
				break;
			case "className":
				Jt(e, "class", r);
				break;
			case "tabIndex":
				Jt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Jt(e, n, r);
				break;
			case "style":
				pn(e, r, o);
				return;
			case "data": if (t !== "object") {
				Jt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = _n(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && Q(e, t, "name", a.name, a, null), Q(e, t, "formEncType", a.formEncType, a, null), Q(e, t, "formMethod", a.formMethod, a, null), Q(e, t, "formTarget", a.formTarget, a, null)) : (Q(e, t, "encType", a.encType, a, null), Q(e, t, "method", a.method, a, null), Q(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = _n(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = vn);
				return;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = _n(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Z("beforetoggle", e), Z("toggle", e), qt(e, "popover", r);
				break;
			case "xlinkActuate":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Yt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Yt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Yt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Yt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				qt(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = hn.get(n) || n, qt(e, n, r);
			else return;
		}
		z = !0;
	}
	function np(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				pn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") un(e, r);
				else if (typeof r == "number" || typeof r == "bigint") un(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = vn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!zt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[Ct] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					z = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : qt(e, n, r);
				}
				return;
		}
		z = !0;
	}
	function rp(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Z("error", e), Z("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: Q(e, t, o, s, n, null);
					}
				}
				a && Q(e, t, "srcSet", n.srcSet, n, null), r && Q(e, t, "src", n.src, n, null);
				return;
			case "input":
				Z("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: Q(e, t, r, d, n, null);
					}
				}
				an(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Z("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: Q(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && sn(e, !!r, n, !0) : sn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Z("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: Q(e, t, s, c, n, null);
				}
				ln(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: Q(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Z("beforetoggle", e), Z("toggle", e), Z("cancel", e), Z("close", e);
				break;
			case "iframe":
			case "object":
				Z("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Bf.length; r++) Z(Bf[r], e);
				break;
			case "image":
				Z("error", e), Z("load", e);
				break;
			case "details":
				Z("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Z("error", e), Z("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: Q(e, t, u, r, n, null);
				}
				return;
			default: if (mn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && np(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && Q(e, t, c, r, n, null));
	}
	var ip = {};
	function ap(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || Q(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (z = !0), o = m;
							break;
						case "name":
							m !== f && (z = !0), a = m;
							break;
						case "checked":
							m !== f && (z = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (z = !0), d = m;
							break;
						case "value":
							m !== f && (z = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (z = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && Q(e, t, p, m, r, f);
					}
				}
				rn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || Q(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (z = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (z = !0), c = o;
						break;
					case "multiple": o !== l && (z = !0), s = o;
					default: o !== l && Q(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? sn(e, !!n, n ? [] : "", !1) : sn(e, !!n, t, !0)) : sn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Q(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (z = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (z = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && Q(e, t, s, a, r, o);
				}
				cn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: Q(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (z = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: Q(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && Q(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: Q(e, t, u, p, r, m);
				}
				return;
			default: if (mn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && np(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || np(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && Q(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || Q(e, t, f, p, r, m);
	}
	function op(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function sp() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && op(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && op(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var cp = null, lp = null;
	function up(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function dp(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function fp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function pp(e, t, n, r) {
		return n = up(n).createElement(e), n[St] = r, n[Ct] = t, rp(n, e, t), It(n), n;
	}
	function mp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var hp = null;
	function gp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== hp && (hp = e, !0) : (hp = null, !1);
	}
	var _p = typeof setTimeout == "function" ? setTimeout : void 0, vp = typeof clearTimeout == "function" ? clearTimeout : void 0, yp = typeof Promise == "function" ? Promise : void 0, bp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : _p, xp = typeof queueMicrotask == "function" ? queueMicrotask : yp === void 0 ? _p : function(e) {
		return yp.resolve(null).then(e).catch(Sp);
	};
	function Sp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Cp(e) {
		return e === "head";
	}
	function wp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Uh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") vm(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, vm(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[kt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && vm(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Uh(t);
	}
	function Tp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Ep(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Dp(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Op(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function kp(e) {
		return Op(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function Ap(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Op(t, n, e);
	}
	function jp(e) {
		return e.documentElement.clientHeight;
	}
	function Mp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Np(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (jp(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Zm(f), u > eh) {
									s.length = o;
									break;
								}
								f = new Promise(Mp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Pp(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Pp.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : D({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Pp.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Pp.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Fp(e) {
		return {
			name: e,
			group: new Pp("group", e),
			imagePair: new Pp("image-pair", e),
			old: new Pp("old", e),
			new: new Pp("new", e)
		};
	}
	function Ip(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Ip.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Vp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = zp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), p(this._fragmentFiber.child, !1, Lp, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Lp(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Ip.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Vp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = zp(i.optionsOrUseCapture), p(this._fragmentFiber.child, !1, Rp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Rp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function zp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function Bp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Vp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = Bp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && Bp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Ip.prototype.dispatchEvent = function(e) {
		var t = h(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, zp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, zp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Ip.prototype.focus = function(e) {
		p(this._fragmentFiber.child, !0, Hp, e, void 0, void 0);
	};
	function Hp(e, t) {
		return e.tag !== 6 && (e = b(e), mm(e, t));
	}
	Ip.prototype.focusLast = function(e) {
		var t = [];
		p(this._fragmentFiber.child, !0, Up, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Hp(t[n], e); n--);
	};
	function Up(e, t) {
		return t.push(e), !1;
	}
	Ip.prototype.blur = function() {
		var e = h(this._fragmentFiber);
		e !== null && (e = b(e), e = up(e).activeElement, e !== null && p(this._fragmentFiber.child, !1, Wp, e, void 0, void 0));
	};
	function Wp(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Ip.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), p(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Ip.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), p(this._fragmentFiber.child, !1, Kp, e, void 0, void 0);
			for (var n = t = 0; n < qp.length; n++) {
				var r = qp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : qp[t++] = r;
			}
			qp.length = t;
		}
	};
	function Kp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var qp = [], Jp = !1;
	function Yp(e, t, n) {
		qp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), Jp || (Jp = !0, hm(function() {
			Jp = !1;
			var e = qp;
			qp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Ip.prototype.getClientRects = function() {
		var e = [];
		return p(this._fragmentFiber.child, !1, Xp, e, void 0, void 0), e;
	};
	function Xp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Ip.prototype.getRootNode = function(e) {
		var t = h(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Ip.prototype.compareDocumentPosition = function(e) {
		var t = h(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		p(this._fragmentFiber.child, !1, Up, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Zp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Zp(e, t, n, r, i) {
		var a = Mt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = h(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = E(n, a, T), t === null ? t = !1 : (p(t, !0, C, a, n), a = x, x = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = E(r, a, T), t === null ? t = !1 : (p(t, !0, w, a, r), a = x, S = x = null, t = a !== null)), t) : !1;
	}
	function Qp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Ip.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		p(this._fragmentFiber.child, !1, Up, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || h(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Qp(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = b(a), Qp(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function $p(e, t) {
		return e = b(e), em(e, t), !1;
	}
	function em(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, zp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < qp.length; i++) {
				var a = qp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (qp[r++] = a);
			}
			qp.length = r, n.observe(e);
		}), em(e, t));
	}
	function nm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, zp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Yp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function rm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					rm(n), jt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function im(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[kt]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = um(e.nextSibling), e === null) break;
		}
		return null;
	}
	function am(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = um(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = um(e.nextSibling), e === null)) return null;
		return e;
	}
	function sm(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function cm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function lm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function um(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var dm = null;
	function fm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return um(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function pm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function mm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function hm(e) {
		bp(function() {
			bp(function(t) {
				return e(t);
			});
		});
	}
	function gm(e, t, n) {
		switch (t = up(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function _m(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && Q(e, t, r, null, ip, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === vn && (e.onclick = null), jt(e);
	}
	function vm(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		jt(e);
	}
	var ym = /* @__PURE__ */ new Map(), bm = /* @__PURE__ */ new Set();
	function xm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var Sm = I.d;
	I.d = {
		f: Cm,
		r: wm,
		D: Dm,
		C: Om,
		L: km,
		m: Am,
		X: Mm,
		S: jm,
		M: Nm
	};
	function Cm() {
		var e = Sm.f(), t = Bd();
		return e || t;
	}
	function wm(e) {
		var t = Nt(e);
		t !== null && t.tag === 5 && t.type === "form" ? tc(t) : Sm.r(e);
	}
	var Tm = typeof document > "u" ? null : document;
	function Em(e, t, n) {
		var r = Tm;
		if (r && typeof t == "string" && t) {
			var i = nn(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), bm.has(i) || (bm.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), rp(t, "link", e), It(t), r.head.appendChild(t)));
		}
	}
	function Dm(e) {
		Sm.D(e), Em("dns-prefetch", e, null);
	}
	function Om(e, t) {
		Sm.C(e, t), Em("preconnect", e, t);
	}
	function km(e, t, n) {
		Sm.L(e, t, n);
		var r = Tm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + nn(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + nn(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + nn(n.imageSizes) + "\"]")) : i += "[href=\"" + nn(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Fm(e);
					break;
				case "script": a = zm(e);
			}
			if (!(ym.has(a) || (e = D({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), ym.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Im(a)) || t === "script" && r.querySelector(Bm(a))))) {
				var o = r.createElement("link");
				rp(o, "link", e), t === "style" && (o[At] = !0, o.onload = o.onerror = function() {
					Lt(o);
				}), It(o), r.head.appendChild(o);
			}
		}
	}
	function Am(e, t) {
		Sm.m(e, t);
		var n = Tm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + nn(r) + "\"][href=\"" + nn(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = zm(e);
			}
			if (!ym.has(a) && (e = D({
				rel: "modulepreload",
				href: e
			}, t), ym.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Bm(a))) return;
				}
				r = n.createElement("link"), rp(r, "link", e), It(r), n.head.appendChild(r);
			}
		}
	}
	function jm(e, t, n) {
		Sm.S(e, t, n);
		var r = Tm;
		if (r && e) {
			var i = Ft(r).hoistableStyles, a = Fm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Im(a))) s.loading = 5;
				else {
					e = D({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = ym.get(a)) && Um(e, n);
					var c = o = r.createElement("link");
					It(c), rp(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Hm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Mm(e, t) {
		Sm.X(e, t);
		var n = Tm;
		if (n && e) {
			var r = Ft(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), It(a), rp(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t) {
		Sm.M(e, t);
		var n = Tm;
		if (n && e) {
			var r = Ft(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), It(a), rp(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Pm(e, t, n, r) {
		var a = (a = Ce.current) ? xm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Fm(n.href), t = Ft(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Fm(n.href);
					var o = Ft(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Im(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = ym.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, ym.set(e, o)), Rm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = zm(n), t = Ft(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Fm(e) {
		return "href=\"" + nn(e) + "\"";
	}
	function Im(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Lm(e) {
		return D({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Rm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[At]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[At] = !0, t.onload = t.onerror = Lt.bind(null, t), rp(t, "link", n), It(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function zm(e) {
		return "[src=\"" + nn(e) + "\"]";
	}
	function Bm(e) {
		return "script[async]" + e;
	}
	function Vm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + nn(n.href) + "\"]");
				if (r) return t.instance = r, It(r), r;
				var a = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), It(r), rp(r, "style", a), Hm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Fm(n.href);
				var o = e.querySelector(Im(a));
				if (o) return t.state.loading |= 4, t.instance = o, It(o), o;
				r = Lm(n), (a = ym.get(a)) && Um(r, a), o = (e.ownerDocument || e).createElement("link"), It(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), rp(o, "link", r), t.state.loading |= 4, Hm(o, n.precedence, e), t.instance = o;
			case "script": return o = zm(n.src), (a = e.querySelector(Bm(o))) ? (t.instance = a, It(a), a) : (r = n, (a = ym.get(o)) && (r = D({}, n), Wm(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), It(a), rp(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Hm(r, n.precedence, e));
		return t.instance;
	}
	function Hm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Wm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Gm = null;
	function Km(e, t, n) {
		if (Gm === null) {
			var r = /* @__PURE__ */ new Map(), i = Gm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Gm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[kt] || a[St] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function qm(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Jm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Ym(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Xm(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Zm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Qm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Zm(t), e.suspenseyImages.push(t)), e = ih.bind(e), t.decode().then(e, e));
	}
	function $m(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Fm(r.href), a = t.querySelector(Im(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = rh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, It(a);
					return;
				}
				a = t.ownerDocument || t, r = Lm(r), (i = ym.get(i)) && Um(r, i), a = a.createElement("link"), It(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), rp(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = rh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var eh = 0;
	function th(e, t) {
		return e.stylesheets && e.count === 0 && oh(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && oh(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && eh === 0 && (eh = 62500 * sp());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && oh(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > eh ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function nh(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) oh(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function rh() {
		this.count--, nh(this);
	}
	function ih() {
		this.imgCount--, nh(this);
	}
	var ah = null;
	function oh(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ah = /* @__PURE__ */ new Map(), t.forEach(sh, e), ah = null, rh.call(e));
	}
	function sh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ah.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ah.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = rh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var ch = {
		$$typeof: te,
		Provider: null,
		Consumer: null,
		_currentValue: ge,
		_currentValue2: ge,
		_threadCount: 0
	};
	function lh(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = dt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = dt(0), this.hiddenUpdates = dt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function uh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new lh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ji(3, null, null, t), e.current = a, a.stateNode = e, t = ja(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, mo(a), e;
	}
	function dh(e) {
		return e ? (e = ki, e) : ki;
	}
	function fh(e, t, n, r, i, a) {
		i = dh(i), r.context === null ? r.context = i : r.pendingContext = i, r = go(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = _o(e, r, t), n !== null && (Fd(n, e, t), vo(n, e, t));
	}
	function ph(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function mh(e, t) {
		ph(e, t), (e = e.alternate) && ph(e, t);
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Ei(e, 67108864);
			t !== null && Fd(t, e, 67108864), mh(e, 67108864);
		}
	}
	function gh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Md();
			t = _t(t);
			var n = Ei(e, t);
			n !== null && Fd(n, e, t), mh(e, t);
		}
	}
	var _h = !0;
	function vh(e, t, n, r) {
		var i = F.T;
		F.T = null;
		var a = I.p;
		try {
			I.p = 2, bh(e, t, n, r);
		} finally {
			I.p = a, F.T = i;
		}
	}
	function yh(e, t, n, r) {
		var i = F.T;
		F.T = null;
		var a = I.p;
		try {
			I.p = 8, bh(e, t, n, r);
		} finally {
			I.p = a, F.T = i;
		}
	}
	function bh(e, t, n, r) {
		if (_h) {
			var i = xh(r);
			if (i === null) qf(e, t, r, Sh, n), Nh(e, r);
			else if (Fh(i, e, t, n, r)) r.stopPropagation();
			else if (Nh(e, r), t & 4 && -1 < Mh.indexOf(e)) {
				for (; i !== null;) {
					var a = Nt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = at(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Qe(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Df(a), !(Qu & 6) && (_d = Be() + 500, Of(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Ei(a, 2), s !== null && Fd(s, a, 2), Bd(), mh(a, 2);
					}
					if (a = xh(r), a === null && qf(e, t, r, Sh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else qf(e, t, r, null, n);
		}
	}
	function xh(e) {
		return e = bn(e), Ch(e);
	}
	var Sh = null;
	function Ch(e) {
		if (Sh = null, e = Mt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return Sh = e, null;
	}
	function wh(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Ve()) {
				case He: return 2;
				case Ue: return 8;
				case We:
				case Ge: return 32;
				case Ke: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var Th = !1, Eh = null, Dh = null, Oh = null, kh = /* @__PURE__ */ new Map(), Ah = /* @__PURE__ */ new Map(), jh = [], Mh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Nh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Eh = null;
				break;
			case "dragenter":
			case "dragleave":
				Dh = null;
				break;
			case "mouseover":
			case "mouseout":
				Oh = null;
				break;
			case "pointerover":
			case "pointerout":
				kh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Ah.delete(t.pointerId);
		}
	}
	function Ph(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Nt(t), t !== null && hh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Fh(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Eh = Ph(Eh, e, t, n, r, i), !0;
			case "dragenter": return Dh = Ph(Dh, e, t, n, r, i), !0;
			case "mouseover": return Oh = Ph(Oh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return kh.set(a, Ph(kh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Ah.set(a, Ph(Ah.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Ih(e) {
		var t = Mt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, bt(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, bt(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Lh(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = xh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				yn = r, n.target.dispatchEvent(r), yn = null;
			} else return t = Nt(n), t !== null && hh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Rh(e, t, n) {
		Lh(e) && n.delete(t);
	}
	function zh() {
		Th = !1, Eh !== null && Lh(Eh) && (Eh = null), Dh !== null && Lh(Dh) && (Dh = null), Oh !== null && Lh(Oh) && (Oh = null), kh.forEach(Rh), Ah.forEach(Rh);
	}
	function Bh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, Th || (Th = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, zh)));
	}
	var Vh = null;
	function Hh(e) {
		Vh !== e && (Vh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Vh === e && (Vh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Ch(r || n) === null) continue;
					break;
				}
				var a = Nt(n);
				a !== null && (e.splice(t, 3), t -= 3, $s(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Uh(e) {
		function t(t) {
			return Bh(t, e);
		}
		Eh !== null && Bh(Eh, e), Dh !== null && Bh(Dh, e), Oh !== null && Bh(Oh, e), kh.forEach(t), Ah.forEach(t);
		for (var n = 0; n < jh.length; n++) {
			var r = jh[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < jh.length && (n = jh[0], n.blockedOn === null);) Ih(n), n.blockedOn === null && jh.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[Ct] || null;
			if (typeof a == "function") o || Hh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[Ct] || null) s = o.formAction;
					else if (Ch(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Hh(n);
			}
		}
	}
	function Wh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Gh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.render = Gh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		fh(n, Md(), e, t, null, null);
	}, Kh.prototype.unmount = Gh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			fh(e.current, 2, null, e, null, null), Bd(), t[wt] = null;
		}
	};
	function Kh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = yt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < jh.length && t !== 0 && t < jh[n].priority; n++);
			jh.splice(n, 0, e), n === 0 && Ih(e);
		}
	};
	var qh = n.version;
	if (qh !== "19.3.0") throw Error(i(527, qh, "19.3.0"));
	I.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : d(e), e = e === null ? null : e.stateNode, e;
	};
	var Jh = {
		bundleType: 0,
		version: "19.3.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: F,
		reconcilerVersion: "19.3.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Yh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Yh.isDisabled && Yh.supportsFiber) try {
			Ye = Yh.inject(Jh), Xe = Yh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Sc, s = Cc, c = wc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = uh(e, 1, !1, null, null, n, r, null, o, s, c, Wh), e[wt] = t.current, Gf(e), new Gh(t);
	};
})), v = (/* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = _();
})))(), y = /* @__PURE__ */ u(m(), 1), b = 1e-9;
function x(e, t) {
	if (!e.length || t <= e[0]) return 0;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r + 1 >> 1;
		e[i] <= t + b ? n = i : r = i - 1;
	}
	return n;
}
function S(e, t, n = 10) {
	return t > 0 ? Math.floor(e / n + b) * n + n : Math.ceil(e / n - b) * n - n;
}
function C({ now: e = () => globalThis.performance.now(), raf: t = (e) => globalThis.requestAnimationFrame(e), caf: n = (e) => globalThis.cancelAnimationFrame(e) } = {}) {
	let r = [], i = 0, a = 60, o = !1, s = !1, c = 0, l = 0, u = null, d = 0, f = 0, p = /* @__PURE__ */ new Set(), m = {
		play: /* @__PURE__ */ new Set(),
		pause: /* @__PURE__ */ new Set(),
		end: /* @__PURE__ */ new Set(),
		seek: /* @__PURE__ */ new Set()
	}, h = () => r.length ? r[r.length - 1] : 0, g = (e) => Math.max(0, Math.min(h(), e)), _ = () => p.forEach((e) => e()), v = (e) => m[e].forEach((e) => e());
	function y() {
		let e = x(r, i);
		(e !== c || i !== l) && (c = e, l = i, _());
	}
	function b() {
		u !== null && n(u), u = null;
	}
	function C(e) {
		if (u = null, !o) return;
		let n = Math.min(250, Math.max(0, e - d));
		i = g(i + n / 1e3 * a), d = Math.max(d, e), i >= h() ? (i = h(), o = !1, y(), _(), v("end")) : (s ? e - f >= 1e3 - 1e-6 && (f = e, y()) : y(), u = t(C));
	}
	function w(t) {
		i = g(t), o && (d = e(), f = d), y(), v("seek");
	}
	let T = {
		load(e) {
			let t = o;
			o = !1, b(), r = Array.from(e ?? []), i = 0, c = 0, l = 0, _(), t && v("pause");
		},
		play() {
			o || r.length < 2 || (i >= h() && (i = 0, y()), o = !0, d = e(), f = d, u = t(C), _(), v("play"));
		},
		pause() {
			o && (o = !1, b(), y(), _(), v("pause"));
		},
		toggle() {
			o ? T.pause() : T.play();
		},
		seekIndex(e) {
			r.length && w(r[Math.max(0, Math.min(r.length - 1, Math.round(e)))]);
		},
		seekTime(e) {
			w(e);
		},
		stepWindow(e) {
			w(S(i, e));
		},
		stepSeconds(e) {
			w(i + e);
		},
		setSpeed(e) {
			let t = Number(e);
			Number.isFinite(t) && t > 0 && (a = t);
		},
		setReduced(e) {
			s = !!e, s || y();
		},
		subscribe(e) {
			return p.add(e), () => p.delete(e);
		},
		on(e, t) {
			return m[e].add(t), () => m[e].delete(t);
		},
		getIndex: () => c,
		getTime: () => l,
		isPlaying: () => o,
		getSpeed: () => a,
		isReduced: () => s,
		getTimes: () => r
	};
	return T;
}
//#endregion
//#region src/hooks/usePlayback.js
var w = C();
function T() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.getIndex);
}
function E() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.getTime);
}
function D() {
	return (0, y.useSyncExternalStore)(w.subscribe, w.isPlaying);
}
//#endregion
//#region src/lib/format.js
var O = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
function k(e) {
	return e == null || !Number.isFinite(Number(e)) ? "n/a" : O.format(Math.round(Number(e)));
}
function A(e) {
	return k(e);
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
var j = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), M = (/* @__PURE__ */ s(((e, t) => {
	t.exports = j();
})))(), N = [
	10,
	30,
	90
];
function ee({ playing: e }) {
	return /* @__PURE__ */ (0, M.jsx)("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 14 14",
		"aria-hidden": "true",
		focusable: "false",
		children: e ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("rect", {
			x: "2",
			y: "1",
			width: "3.5",
			height: "12",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, M.jsx)("rect", {
			x: "8.5",
			y: "1",
			width: "3.5",
			height: "12",
			fill: "currentColor"
		})] }) : /* @__PURE__ */ (0, M.jsx)("path", {
			d: "M3 1 L12.5 7 L3 13 Z",
			fill: "currentColor"
		})
	});
}
var te = (0, y.memo)(function({ disabled: e }) {
	let t = D(), n = t ? "Pause" : "Play";
	return /* @__PURE__ */ (0, M.jsxs)("button", {
		type: "button",
		className: "btn-primary play-btn",
		"aria-label": n,
		onClick: () => w.toggle(),
		disabled: e,
		children: [/* @__PURE__ */ (0, M.jsx)(ee, { playing: t }), /* @__PURE__ */ (0, M.jsx)("span", { children: n })]
	});
});
function ne(e) {
	if (!(e.altKey || e.ctrlKey || e.metaKey)) switch (e.key) {
		case "ArrowLeft":
		case "ArrowRight":
			e.preventDefault(), w.stepWindow(e.key === "ArrowRight" ? 1 : -1);
			break;
		case "PageDown":
		case "PageUp": e.preventDefault(), w.stepSeconds(e.key === "PageUp" ? 60 : -60);
	}
}
var re = (0, y.memo)(function({ id: e, view: t, disabled: n }) {
	let r = T(), i = t ? t.n : 1, a = Math.min(r, i - 1), o = t ? `t = ${A(t.t[a])} s of ${A(t.tEnd)} s${a >= t.jamIdx ? ", GPS jammed" : ""}` : "Loading";
	return /* @__PURE__ */ (0, M.jsx)("input", {
		id: e,
		type: "range",
		className: "scrubber",
		min: 0,
		max: Math.max(0, i - 1),
		step: 1,
		value: a,
		"aria-valuetext": o,
		onChange: (e) => w.seekIndex(Number(e.target.value)),
		onKeyDown: ne,
		disabled: n
	});
}), ie = (0, y.memo)(function({ view: e }) {
	let t = E();
	return /* @__PURE__ */ (0, M.jsx)("span", {
		className: "time-readout",
		children: e ? `t = ${A(t)} s / ${A(e.tEnd)} s` : "t = – s"
	});
});
function ae({ view: e, speed: t, onSpeedChange: n, disabled: r = !1 }) {
	let i = (0, y.useId)(), a = (0, y.useId)(), o = r || !e;
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "playback-row",
		children: [
			/* @__PURE__ */ (0, M.jsx)(te, { disabled: o }),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "field field-slider",
				children: [/* @__PURE__ */ (0, M.jsx)("label", {
					htmlFor: i,
					children: "Flight time"
				}), /* @__PURE__ */ (0, M.jsxs)("div", {
					className: "slider-row",
					children: [/* @__PURE__ */ (0, M.jsx)(re, {
						id: i,
						view: e,
						disabled: o
					}), /* @__PURE__ */ (0, M.jsx)(ie, { view: e })]
				})]
			}),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "field field-speed",
				children: [/* @__PURE__ */ (0, M.jsx)("label", {
					htmlFor: a,
					children: "Speed"
				}), /* @__PURE__ */ (0, M.jsx)("select", {
					id: a,
					value: t,
					onChange: (e) => n(Number(e.target.value)),
					disabled: r,
					children: N.map((e) => /* @__PURE__ */ (0, M.jsx)("option", {
						value: e,
						children: `${e}×`
					}, e))
				})]
			})
		]
	});
}
//#endregion
//#region src/components/Badge.jsx
var oe = /* @__PURE__ */ new Set([
	"neutral",
	"ok",
	"attention"
]);
function P({ variant: e = "neutral", mono: t = !1, children: n }) {
	let r = oe.has(e) ? e : "neutral";
	return /* @__PURE__ */ (0, M.jsx)("span", {
		className: `badge badge-${r}${t ? " badge-mono" : ""}`,
		children: n
	});
}
//#endregion
//#region src/components/StatusStrip.jsx
var se = {
	replay: "precomputed replay",
	computing: "computing in-page…",
	computed: "computed in-page"
}, ce = {
	stored: "stored motor draw",
	drawn: "motor drawn by this Run's IonQ job"
}, le = {
	1: "submitting one IonQ job…",
	2: "decoding counts (RNG bits, probes, GHZ contrast)…",
	3: "flying the UAV in-page…",
	4: "map matching and scoring…"
}, ue = "Built-in simulator: probe blocks computed analytically, not sampled.", de = (e) => `Step ${e} of 4: ${le[e] ?? le[1]}`, fe = (e) => `fallback: precomputed replay (${e})`;
function pe(e, t, n) {
	let r = `GPS is jammed at t = ${Math.round(Number(t))} s.`;
	return n ? `Showing the recorded flight: ${e}. Press Run one IonQ job to draw a new motor and fly this map, or Play to watch. ${r}` : `Showing the recorded flight: ${e}. Press Play to watch. ${r}`;
}
function me({ stage: e, progress: t, elapsedS: n, reduced: r }) {
	let i = Math.max(1, Math.min(4, e || 1)), a = t?.samplesTotal ?? 0, o = t?.samplesDone ?? 0, s = Math.min(90, Math.max(0, Math.floor(n ?? 0)));
	return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [!r && i >= 3 && a > 0 && /* @__PURE__ */ (0, M.jsx)("progress", {
		max: a,
		value: o,
		"aria-label": "Live run progress"
	}), /* @__PURE__ */ (0, M.jsxs)("p", {
		className: "live-counter",
		children: [a > 0 ? `${o} of ${a} samples · ` : "", `${s} s of 90 s`]
	})] });
}
function he({ mode: e = "replay", motor: t = "stored", mapLabel: n = null, fallbackLabel: r = null, bitsLabel: i = null, message: a = null, danger: o = null, notice: s = null, focusRef: c = null, children: l = null }) {
	return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "panel status-strip",
		"aria-label": "Run status",
		children: [
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "badge-row",
				children: [
					/* @__PURE__ */ (0, M.jsx)(P, {
						variant: e === "computed" ? "ok" : "neutral",
						children: se[e] ?? se.replay
					}),
					r && /* @__PURE__ */ (0, M.jsx)(P, {
						variant: "attention",
						children: fe(r)
					}),
					t && /* @__PURE__ */ (0, M.jsx)(P, { children: ce[t] ?? ce.stored }),
					i && /* @__PURE__ */ (0, M.jsx)(P, { children: i }),
					n && /* @__PURE__ */ (0, M.jsx)(P, { children: n })
				]
			}),
			/* @__PURE__ */ (0, M.jsx)("p", {
				className: "status-message",
				tabIndex: -1,
				ref: c,
				children: a ?? ""
			}),
			/* @__PURE__ */ (0, M.jsx)("div", {
				className: "live-progress",
				hidden: !l,
				children: l
			}),
			s && /* @__PURE__ */ (0, M.jsx)("p", {
				className: "info-notice",
				children: s
			}),
			o && /* @__PURE__ */ (0, M.jsx)("p", {
				className: "danger-notice",
				children: o
			})
		]
	});
}
var F = 1024, I = 1e4;
function ge(e, t) {
	let n = Error(t);
	return n.name = e, n;
}
function _e(e, t) {
	if (!e || typeof e != "object") throw ge("InvalidShape", `${t} returned no JSON object`);
	if (e.ok !== !0) throw ge(String(e.error_type ?? "Error"), String(e.error ?? `${t} failed`));
	return e;
}
var ve = () => ge("TimeoutError", "Live run took longer than 90 s"), L = () => ge("AbortError", "Live run cancelled");
async function ye({ callPy: e, scenario: t, hasBackend: n = !0, simulateFailure: r = !1, validate: i = () => [], now: a, yieldFn: o = async () => {}, nextFrame: s = null, onStage: c = () => {}, onQuantum: l = () => {}, onStep: u = () => {}, isCancelled: d = () => !1 }) {
	if (!n) throw ge("NoBackend", "Needs a backend: press Run on Qollab and pick one");
	let f = a(), p = () => a() - f, m = 0, h = null, g = (e) => {
		e > m && (m = e, c(e));
	}, _ = () => {
		if (d()) throw L();
		if (p() > 9e4) throw ve();
	}, v = async (...t) => {
		_();
		let n = Promise.resolve(e(...t));
		if (!s) return n;
		let r = !1, i = (async () => {
			for (; !r;) {
				if (await s(), r) return;
				let e = null;
				if (d() ? e = L() : p() > 9e4 && (e = ve()), e) throw e.abandoned = !0, n.catch(() => {}), e;
			}
		})();
		try {
			return await Promise.race([n, i]);
		} finally {
			r = !0;
		}
	};
	try {
		g(1), _e(await v("uav_start", t, !!r), "uav_start"), await o(), h = _e(await v("uav_quantum", F), "uav_quantum"), g(2), l(h), await o();
		for (let e = 0;; e += 1) {
			if (e >= I) throw ge("InvalidShape", "live_step never reported done");
			let t = _e(await v("live_step", 250), "live_step");
			if (g(3), u(t), t.done === !0) break;
			await o();
		}
		await o(), g(4);
		let e = _e(await v("live_result"), "live_result"), n = e?.scenario?.id;
		if (n !== t) throw ge("ScenarioMismatch", `live_result is for ${String(n)}, not ${String(t)}`);
		let a = i(e);
		if (a.length) throw ge("InvalidPayload", a.slice(0, 3).join("; "));
		return {
			ok: !0,
			result: e,
			quantum: h,
			elapsedMs: p()
		};
	} catch (t) {
		let n = t instanceof Error ? t : ge("Error", String(t));
		try {
			let t = Promise.resolve(e("live_cancel"));
			n.abandoned ? t.catch(() => {}) : await t;
		} catch {}
		throw n.stage = m || 1, n.elapsedMs = p(), n.quantum = h, n;
	}
}
function be(e) {
	let t = !1, n = !1;
	return {
		isInFlight: () => t,
		start(r) {
			return t ? Promise.reject(ge("Busy", "A live run is already in progress")) : (t = !0, n = !1, ye({
				...e,
				...r,
				isCancelled: () => n
			}).finally(() => {
				t = !1;
			}));
		},
		cancel() {
			t && (n = !0);
		}
	};
}
//#endregion
//#region src/components/JobPanel.jsx
var xe = "not received", Se = "waiting for IonQ…", Ce = "Not captured yet. The single Forte 1 job runs only with the builder's explicit approval; until then a forte-1 noise-model run is shown, labelled \"simulator-sampled proxy\".", we = (e) => e != null && e !== "" && Number.isFinite(Number(e)), Te = (e, t) => we(e) ? Number(e).toFixed(t) : xe, Ee = (e) => typeof e == "string" && e ? e.slice(0, 12) : xe;
function De(e) {
	if (typeof e != "string" || !e) return xe;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : `${t.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}
function Oe(e) {
	return typeof e != "string" || !/^[0-9a-f]{16}$/.test(e) ? null : BigInt(`0x${e}`).toString(2).padStart(64, "0").match(/.{8}/g).join(" ");
}
var ke = (e) => e?.is_qpu === !0 ? "QPU-measured" : "simulator-sampled", Ae = (e, t) => we(e) && we(t) ? `${Math.round(Number(e))}–${Math.round(Number(t))} RPM (swept)` : xe, je = (e, t) => Array.isArray(e) && e.length ? e.map((e) => Te(e, t)).join(", ") : xe;
function R({ label: e, children: t }) {
	return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("dt", { children: e }), /* @__PURE__ */ (0, M.jsx)("dd", { children: t })] });
}
var Me = (e, t) => we(t) ? Number(t) ** (e / 4) : null;
function Ne({ n: e, c: t, cDefault: n }) {
	return /* @__PURE__ */ (0, M.jsxs)("span", {
		className: "dd-inline",
		children: [/* @__PURE__ */ (0, M.jsx)("span", {
			className: "mono",
			children: we(t) ? `${Number(t).toFixed(3)} (model default ${Te(n, 3)})` : xe
		}), /* @__PURE__ */ (0, M.jsx)(P, { children: `entangled probe n = ${e}` })]
	});
}
function Pe({ motor: e }) {
	let t = Array.isArray(e?.rpm_knots) ? e.rpm_knots : [];
	return /* @__PURE__ */ (0, M.jsxs)("dl", {
		className: "job-dl",
		children: [
			/* @__PURE__ */ (0, M.jsxs)(R, {
				label: "Motor RPM",
				children: [
					t.length ? Ae(Math.min(...t), Math.max(...t)) : xe,
					" ",
					/* @__PURE__ */ (0, M.jsx)(P, { children: "stored motor draw" })
				]
			}),
			/* @__PURE__ */ (0, M.jsx)(R, {
				label: "Harmonic amplitudes (nT)",
				children: /* @__PURE__ */ (0, M.jsx)("span", {
					className: "mono",
					children: je(e?.amps_nT, 0)
				})
			}),
			/* @__PURE__ */ (0, M.jsx)(R, {
				label: "Harmonic phases (rad)",
				children: /* @__PURE__ */ (0, M.jsx)("span", {
					className: "mono",
					children: je(e?.phases, 2)
				})
			}),
			/* @__PURE__ */ (0, M.jsxs)(R, {
				label: "Seed",
				children: [
					/* @__PURE__ */ (0, M.jsx)("span", {
						className: "mono selectable",
						children: e?.seed_str ?? xe
					}),
					" ",
					/* @__PURE__ */ (0, M.jsx)("span", {
						className: "help",
						children: "stored seed, not drawn this Run"
					})
				]
			})
		]
	});
}
function Fe({ hardware: e }) {
	let t = e?.record ?? null, n;
	if (e?.status === "ok" && t) {
		let e = t.label === "QPU-measured", r = t.ghz_measured ?? {};
		n = /* @__PURE__ */ (0, M.jsxs)("dl", {
			className: "job-dl",
			children: [
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Label",
					children: /* @__PURE__ */ (0, M.jsx)(P, { children: e ? "hardware · QPU-measured" : "simulator-sampled proxy" })
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Job ID",
					children: /* @__PURE__ */ (0, M.jsx)("span", {
						className: "mono selectable",
						children: t.job_id ?? xe
					})
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Backend",
					children: /* @__PURE__ */ (0, M.jsx)(P, { children: `backend: ${t.backend ?? xe}` })
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Shots",
					children: we(t.shots) ? `${t.shots} shots` : xe
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Timestamp",
					children: De(t.timestamp_utc)
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "Circuit SHA-256 (first 12 hex)",
					children: /* @__PURE__ */ (0, M.jsx)("span", {
						className: "mono",
						children: Ee(t.circuit_sha256)
					})
				}),
				/* @__PURE__ */ (0, M.jsx)(R, {
					label: "GHZ-2 / GHZ-4 contrast",
					children: /* @__PURE__ */ (0, M.jsx)("span", {
						className: "mono",
						children: `${Te(r.c2, 3)} / ${Te(r.c4, 3)}`
					})
				})
			]
		});
	} else n = e?.status === "missing" ? /* @__PURE__ */ (0, M.jsx)("p", {
		className: "help",
		children: Ce
	}) : e?.status === "error" ? /* @__PURE__ */ (0, M.jsx)("p", {
		className: "help",
		children: `Could not read the capture record (${e.error}).`
	}) : /* @__PURE__ */ (0, M.jsx)("p", {
		className: "help",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, M.jsxs)("details", {
		className: "job-details",
		children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: "Hardware capture (Forte 1)" }), n]
	});
}
function Ie({ storedMotor: e = null, quantum: t = null, started: n = !1, failed: r = !1, backendName: i = null, isIonq: a = !1, flownLabel: o = null, hardware: s = null, circuitSha: c = null, modelSha: l = null }) {
	let u = t, d = n && !u && !r ? Se : xe, f = u?.backend ?? i, p = u ? String(u.backend_class ?? "").startsWith("IonQ") || String(u.backend ?? "").startsWith("ionq") : a, m = Oe(u?.seed_hex), h = Array.isArray(u?.rng_hist) ? u.rng_hist : null;
	return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "panel job-panel",
		"aria-labelledby": "job-panel-h2",
		children: [
			/* @__PURE__ */ (0, M.jsx)("h2", {
				id: "job-panel-h2",
				children: "This Run's IonQ job"
			}),
			!n && /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
				/* @__PURE__ */ (0, M.jsx)("h3", {
					className: "empty-heading",
					children: "No IonQ job this Run yet"
				}),
				/* @__PURE__ */ (0, M.jsx)("p", {
					className: "help",
					children: "The values below are the stored motor draw used by both recorded flights. Press Run one IonQ job to draw a new motor from quantum random bits."
				}),
				/* @__PURE__ */ (0, M.jsx)(Pe, { motor: e })
			] }),
			n && /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
				/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "badge-row",
					children: [
						u && /* @__PURE__ */ (0, M.jsx)(P, { children: ke(u) }),
						f && (p ? /* @__PURE__ */ (0, M.jsx)(P, { children: `backend: ${f}` }) : /* @__PURE__ */ (0, M.jsx)(P, { children: "built-in simulator" })),
						/* @__PURE__ */ (0, M.jsx)(P, { children: `${u?.shots ?? 1024} shots` }),
						u?.timestamp_utc && /* @__PURE__ */ (0, M.jsx)(P, { children: De(u.timestamp_utc) })
					]
				}),
				o && /* @__PURE__ */ (0, M.jsx)("p", {
					className: "flown-on",
					children: `Flown on: ${o}`
				}),
				/* @__PURE__ */ (0, M.jsxs)("dl", {
					className: "job-dl",
					children: [
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Job ID",
							children: /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono selectable",
								children: u?.job_id ?? d
							})
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Backend",
							children: /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono",
								children: f ?? xe
							})
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Shots",
							children: `${u?.shots ?? 1024} shots`
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Timestamp",
							children: u ? De(u.timestamp_utc) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "RNG bits",
							children: h && m ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("span", { children: `${u.rng_n_qubits} qubits, ${h.length}-bin histogram over ${u.counts_sum} shots, hashed to 64 bits:` }), /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono selectable bits",
								children: m
							})] }) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Seed",
							children: u?.seed_hex ? /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono selectable",
								children: `0x${u.seed_hex} (${u.seed_str})`
							}) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Motor RPM",
							children: u ? Ae(u.motor?.rpm_min, u.motor?.rpm_max) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Harmonic amplitudes (nT)",
							children: /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono",
								children: u ? je(u.motor?.amps_nT, 0) : d
							})
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Harmonic phases (rad)",
							children: /* @__PURE__ */ (0, M.jsx)("span", {
								className: "mono",
								children: u ? je(u.motor?.phases, 2) : d
							})
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "GHZ-2 contrast",
							children: u ? /* @__PURE__ */ (0, M.jsx)(Ne, {
								n: 2,
								c: u.c_hat?.c2,
								cDefault: Me(2, u.c_n_default)
							}) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "GHZ-4 contrast",
							children: u ? /* @__PURE__ */ (0, M.jsx)(Ne, {
								n: 4,
								c: u.c_hat?.c4,
								cDefault: u.c_n_default
							}) : d
						}),
						/* @__PURE__ */ (0, M.jsx)(R, {
							label: "Contrast used by the emulator",
							children: u ? /* @__PURE__ */ (0, M.jsxs)("span", {
								className: "dd-inline",
								children: [
									/* @__PURE__ */ (0, M.jsx)("span", {
										className: "mono",
										children: Te(u.c_n_used, 3)
									}),
									/* @__PURE__ */ (0, M.jsx)(P, { children: u.c_n_source === "measured this Run" ? "measured this Run" : "default model, not measured" }),
									u.c_n_note ? /* @__PURE__ */ (0, M.jsx)("span", {
										className: "help",
										children: u.c_n_note
									}) : null
								]
							}) : d
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, M.jsx)(Fe, { hardware: s }),
			/* @__PURE__ */ (0, M.jsxs)("details", {
				className: "job-details",
				children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: "Provenance" }), /* @__PURE__ */ (0, M.jsxs)("dl", {
					className: "job-dl",
					children: [/* @__PURE__ */ (0, M.jsx)(R, {
						label: "Circuit SHA-256 (first 12 hex)",
						children: /* @__PURE__ */ (0, M.jsx)("span", {
							className: "mono",
							children: Ee(u?.circuit_sha256 ?? c)
						})
					}), /* @__PURE__ */ (0, M.jsx)(R, {
						label: "Model SHA-256 (first 12 hex)",
						children: /* @__PURE__ */ (0, M.jsx)("span", {
							className: "mono",
							children: Ee(l)
						})
					})]
				})]
			})
		]
	});
}
//#endregion
//#region node_modules/d3-color/src/define.js
function Le(e, t, n) {
	e.prototype = t.prototype = n, n.constructor = e;
}
function Re(e, t) {
	var n = Object.create(e.prototype);
	for (var r in t) n[r] = t[r];
	return n;
}
//#endregion
//#region node_modules/d3-color/src/color.js
function ze() {}
var Be = .7, Ve = 1 / Be, He = "\\s*([+-]?\\d+)\\s*", Ue = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", We = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Ge = /^#([0-9a-f]{3,8})$/, Ke = RegExp(`^rgb\\(${He},${He},${He}\\)$`), qe = RegExp(`^rgb\\(${We},${We},${We}\\)$`), Je = RegExp(`^rgba\\(${He},${He},${He},${Ue}\\)$`), Ye = RegExp(`^rgba\\(${We},${We},${We},${Ue}\\)$`), Xe = RegExp(`^hsl\\(${Ue},${We},${We}\\)$`), Ze = RegExp(`^hsla\\(${Ue},${We},${We},${Ue}\\)$`), Qe = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
Le(ze, rt, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: $e,
	formatHex: $e,
	formatHex8: et,
	formatHsl: tt,
	formatRgb: nt,
	toString: nt
});
function $e() {
	return this.rgb().formatHex();
}
function et() {
	return this.rgb().formatHex8();
}
function tt() {
	return gt(this).formatHsl();
}
function nt() {
	return this.rgb().formatRgb();
}
function rt(e) {
	var t, n;
	return e = (e + "").trim().toLowerCase(), (t = Ge.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? it(t) : n === 3 ? new ct(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? at(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? at(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Ke.exec(e)) ? new ct(t[1], t[2], t[3], 1) : (t = qe.exec(e)) ? new ct(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Je.exec(e)) ? at(t[1], t[2], t[3], t[4]) : (t = Ye.exec(e)) ? at(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Xe.exec(e)) ? ht(t[1], t[2] / 100, t[3] / 100, 1) : (t = Ze.exec(e)) ? ht(t[1], t[2] / 100, t[3] / 100, t[4]) : Qe.hasOwnProperty(e) ? it(Qe[e]) : e === "transparent" ? new ct(NaN, NaN, NaN, 0) : null;
}
function it(e) {
	return new ct(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function at(e, t, n, r) {
	return r <= 0 && (e = t = n = NaN), new ct(e, t, n, r);
}
function ot(e) {
	return e instanceof ze || (e = rt(e)), e ? (e = e.rgb(), new ct(e.r, e.g, e.b, e.opacity)) : new ct();
}
function st(e, t, n, r) {
	return arguments.length === 1 ? ot(e) : new ct(e, t, n, r ?? 1);
}
function ct(e, t, n, r) {
	this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
Le(ct, st, Re(ze, {
	brighter(e) {
		return e = e == null ? Ve : Ve ** +e, new ct(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? Be : Be ** +e, new ct(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new ct(pt(this.r), pt(this.g), pt(this.b), ft(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: lt,
	formatHex: lt,
	formatHex8: ut,
	formatRgb: dt,
	toString: dt
}));
function lt() {
	return `#${mt(this.r)}${mt(this.g)}${mt(this.b)}`;
}
function ut() {
	return `#${mt(this.r)}${mt(this.g)}${mt(this.b)}${mt((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function dt() {
	let e = ft(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${pt(this.r)}, ${pt(this.g)}, ${pt(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function ft(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function pt(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function mt(e) {
	return e = pt(e), (e < 16 ? "0" : "") + e.toString(16);
}
function ht(e, t, n, r) {
	return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new vt(e, t, n, r);
}
function gt(e) {
	if (e instanceof vt) return new vt(e.h, e.s, e.l, e.opacity);
	if (e instanceof ze || (e = rt(e)), !e) return new vt();
	if (e instanceof vt) return e;
	e = e.rgb();
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = NaN, s = a - i, c = (a + i) / 2;
	return s ? (o = t === a ? (n - r) / s + (n < r) * 6 : n === a ? (r - t) / s + 2 : (t - n) / s + 4, s /= c < .5 ? a + i : 2 - a - i, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new vt(o, s, c, e.opacity);
}
function _t(e, t, n, r) {
	return arguments.length === 1 ? gt(e) : new vt(e, t, n, r ?? 1);
}
function vt(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
Le(vt, _t, Re(ze, {
	brighter(e) {
		return e = e == null ? Ve : Ve ** +e, new vt(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? Be : Be ** +e, new vt(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < .5 ? n : 1 - n) * t, i = 2 * n - r;
		return new ct(xt(e >= 240 ? e - 240 : e + 120, i, r), xt(e, i, r), xt(e < 120 ? e + 240 : e - 120, i, r), this.opacity);
	},
	clamp() {
		return new vt(yt(this.h), bt(this.s), bt(this.l), ft(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		let e = ft(this.opacity);
		return `${e === 1 ? "hsl(" : "hsla("}${yt(this.h)}, ${bt(this.s) * 100}%, ${bt(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
	}
}));
function yt(e) {
	return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function bt(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function xt(e, t, n) {
	return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
//#endregion
//#region node_modules/d3-interpolate/src/constant.js
var St = (e) => () => e;
//#endregion
//#region node_modules/d3-interpolate/src/color.js
function Ct(e, t) {
	return function(n) {
		return e + n * t;
	};
}
function wt(e, t, n) {
	return e **= +n, t = t ** +n - e, n = 1 / n, function(r) {
		return (e + r * t) ** +n;
	};
}
function Tt(e) {
	return (e = +e) == 1 ? Et : function(t, n) {
		return n - t ? wt(t, n, e) : St(isNaN(t) ? n : t);
	};
}
function Et(e, t) {
	var n = t - e;
	return n ? Ct(e, n) : St(isNaN(e) ? t : e);
}
//#endregion
//#region node_modules/d3-interpolate/src/rgb.js
var Dt = (function e(t) {
	var n = Tt(t);
	function r(e, t) {
		var r = n((e = st(e)).r, (t = st(t)).r), i = n(e.g, t.g), a = n(e.b, t.b), o = Et(e.opacity, t.opacity);
		return function(t) {
			return e.r = r(t), e.g = i(t), e.b = a(t), e.opacity = o(t), e + "";
		};
	}
	return r.gamma = e, r;
})(1);
//#endregion
//#region node_modules/d3-interpolate/src/numberArray.js
function Ot(e, t) {
	t ||= [];
	var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), i;
	return function(a) {
		for (i = 0; i < n; ++i) r[i] = e[i] * (1 - a) + t[i] * a;
		return r;
	};
}
function kt(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
//#endregion
//#region node_modules/d3-interpolate/src/array.js
function At(e, t) {
	for (var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, i = Array(r), a = Array(n), o = 0; o < r; ++o) i[o] = zt(e[o], t[o]);
	for (; o < n; ++o) a[o] = t[o];
	return function(e) {
		for (o = 0; o < r; ++o) a[o] = i[o](e);
		return a;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/date.js
function jt(e, t) {
	var n = /* @__PURE__ */ new Date();
	return e = +e, t = +t, function(r) {
		return n.setTime(e * (1 - r) + t * r), n;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/number.js
function Mt(e, t) {
	return e = +e, t = +t, function(n) {
		return e * (1 - n) + t * n;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/object.js
function Nt(e, t) {
	var n = {}, r = {}, i;
	for (i in (typeof e != "object" || !e) && (e = {}), (typeof t != "object" || !t) && (t = {}), t) i in e ? n[i] = zt(e[i], t[i]) : r[i] = t[i];
	return function(e) {
		for (i in n) r[i] = n[i](e);
		return r;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/string.js
var Pt = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Ft = new RegExp(Pt.source, "g");
function It(e) {
	return function() {
		return e;
	};
}
function Lt(e) {
	return function(t) {
		return e(t) + "";
	};
}
function Rt(e, t) {
	var n = Pt.lastIndex = Ft.lastIndex = 0, r, i, a, o = -1, s = [], c = [];
	for (e += "", t += ""; (r = Pt.exec(e)) && (i = Ft.exec(t));) (a = i.index) > n && (a = t.slice(n, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, c.push({
		i: o,
		x: Mt(r, i)
	})), n = Ft.lastIndex;
	return n < t.length && (a = t.slice(n), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? Lt(c[0].x) : It(t) : (t = c.length, function(e) {
		for (var n = 0, r; n < t; ++n) s[(r = c[n]).i] = r.x(e);
		return s.join("");
	});
}
//#endregion
//#region node_modules/d3-interpolate/src/value.js
function zt(e, t) {
	var n = typeof t, r;
	return t == null || n === "boolean" ? St(t) : (n === "number" ? Mt : n === "string" ? (r = rt(t)) ? (t = r, Dt) : Rt : t instanceof rt ? Dt : t instanceof Date ? jt : kt(t) ? Ot : Array.isArray(t) ? At : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? Nt : Mt)(e, t);
}
//#endregion
//#region node_modules/d3-interpolate/src/round.js
function Bt(e, t) {
	return e = +e, t = +t, function(n) {
		return Math.round(e * (1 - n) + t * n);
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/piecewise.js
function Vt(e, t) {
	t === void 0 && (t = e, e = zt);
	for (var n = 0, r = t.length - 1, i = t[0], a = Array(r < 0 ? 0 : r); n < r;) a[n] = e(i, i = t[++n]);
	return function(e) {
		var t = Math.max(0, Math.min(r - 1, Math.floor(e *= r)));
		return a[t](e - t);
	};
}
//#endregion
//#region node_modules/d3-scale-chromatic/src/sequential-multi/cividis.js
function Ht(e) {
	return e = Math.max(0, Math.min(1, e)), "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - e * (35.34 - e * (2381.73 - e * (6402.7 - e * (7024.72 - e * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + e * (170.73 + e * (52.82 - e * (131.46 - e * (176.58 - e * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + e * (442.36 - e * (2482.43 - e * (6167.24 - e * (6614.94 - e * 2475.67))))))) + ")";
}
//#endregion
//#region src/lib/colormap.js
function Ut() {
	let e = /* @__PURE__ */ new Uint8ClampedArray(768);
	for (let t = 0; t < 256; t++) {
		let [n, r, i] = Ht(t / 255).match(/\d+/g).map(Number);
		e[3 * t] = n, e[3 * t + 1] = r, e[3 * t + 2] = i;
	}
	return e;
}
function Wt(e, t, n = .02, r = .98) {
	let i = [];
	for (let n = 0; n < e.length; n++) t[n] && i.push(e[n]);
	if (!i.length) return [0, 1];
	i.sort((e, t) => e - t);
	let a = i[Math.floor(n * (i.length - 1))], o = i[Math.ceil(r * (i.length - 1))];
	return o > a ? [a, o] : [a, a + 1];
}
function Gt([e, t]) {
	let n = Math.ceil(e / 100) * 100, r = Math.floor(t / 100) * 100, i = [n];
	return n < 0 && r > 0 && i.push(0), r > n && i.push(r), i.map((e) => ({
		value: e + 0,
		label: e === 0 ? "0" : `${k(e)} nT`
	}));
}
//#endregion
//#region src/lib/geo.js
function z(e, t, n = 520) {
	let { nx: r, ny: i, x_min: a, x_max: o, y_min: s, y_max: c } = e, l = (o - a) / (r - 1), u = (c - s) / (i - 1), d = a - l / 2, f = c + u / 2, p = r * l, m = i * u, h = m / p, g = Math.max(1, t), _ = g * h;
	return _ > n && (_ = n, g = _ / h), {
		W: g,
		H: _,
		dx: l,
		dy: u,
		aspect: h,
		toPx: (e, t) => [(e - d) / p * g, (f - t) / m * _]
	};
}
//#endregion
//#region src/lib/artifactV2.js
var Kt = "synthetic map (sensitivity study), not survey data", qt = "uav_run", Jt = "uav_live", Yt = [
	"baseline_ls",
	"baseline_mean",
	"quantum_q1",
	"quantum_ghz4"
], Xt = ["quantum_q1", "quantum_ghz4"], Zt = ["synthetic_100m", "eastern_400m"], Qt = ["dead_reckoning", ...Yt], $t = ["QPU-measured", "simulator-sampled"], en = ["measured this Run", "default model, not measured"], tn = [
	"schema_version",
	"kind",
	"title",
	"thresholds_m",
	"estimators",
	"default_estimator",
	"S",
	"model_sha256",
	"motor",
	"default_scenario",
	"scenarios",
	"comparison"
], nn = [
	"id",
	"label",
	"map_label",
	"map_caption",
	"synthetic",
	"alt_m",
	"model_file",
	"model_sha256",
	"map",
	"notes",
	"provenance",
	"line"
], rn = [
	"line",
	"map_file",
	"frame",
	"map_preview",
	"jam",
	"metric_start_index",
	"t",
	"truth",
	"dead_reckoning",
	"estimates",
	"metrics",
	"sensor"
], an = [
	"t_knots",
	"rpm_knots",
	"amps_nT",
	"phases",
	"A1_nT"
], on = (e) => typeof e == "object" && !!e && !Array.isArray(e), sn = (e) => Array.isArray(e) ? e.length : -1, cn = (e) => typeof e == "string" && /^[0-9a-f]{64}$/.test(e), ln = (e) => typeof e == "string" && /^[0-9]+$/.test(e);
function un(e, t = "line") {
	if (!on(e)) return [`${t} is not an object`];
	let n = rn.filter((t) => !(t in e));
	if (n.length) return [`${t}: missing ${n.join(", ")}`];
	let r = [], i = sn(e.t);
	if (i < 2) return [`${t}: t must have at least 2 points`];
	let a = (e, n) => {
		sn(e) !== i && r.push(`${t}: ${n} has ${sn(e)} points, t has ${i}`);
	};
	a(e.truth?.x, "truth.x"), a(e.truth?.y, "truth.y"), a(e.truth?.anomaly_nT, "truth.anomaly_nT"), a(e.dead_reckoning?.x, "dead_reckoning.x"), a(e.dead_reckoning?.y, "dead_reckoning.y");
	let o = e.jam?.display_index;
	(!Number.isInteger(o) || o < 0 || o >= i) && r.push(`${t}: jam.display_index ${o} out of range`), (!(Number(e.jam?.index) > 0) || !Number.isFinite(Number(e.jam?.t))) && r.push(`${t}: jam.index / jam.t invalid`);
	let s = e.map_preview;
	(!on(s) || sn(s.nT) !== s.nx * s.ny || sn(s.valid) !== s.nx * s.ny || s.nx < 2 || s.ny < 2) && r.push(`${t}: map_preview grid does not match nx * ny`);
	let c = on(e.estimates) ? e.estimates : {}, l = Object.keys(c).sort();
	l.join(",") !== [...Yt].sort().join(",") && r.push(`${t}: estimates keys ${l.join(",")} != ${Yt.join(",")}`);
	for (let e of Yt) {
		let n = c[e];
		if (!on(n)) continue;
		a(n.x, `estimates.${e}.x`), a(n.y, `estimates.${e}.y`), a(n.signal_nT, `estimates.${e}.signal_nT`);
		let i = sn(n.window_t);
		(i < 0 || sn(n.ncc) !== i || sn(n.accepted) !== i) && r.push(`${t}: ${e} window_t/ncc/accepted lengths disagree`);
	}
	on(e.metrics?.dead_reckoning) || r.push(`${t}: metrics.dead_reckoning missing`);
	for (let n of Yt) on(e.metrics?.[n]) || r.push(`${t}: metrics.${n} missing`);
	return r;
}
function dn(e, t) {
	let n = [];
	for (let r of [
		"label",
		"map_label",
		"map_caption"
	]) (typeof e[r] != "string" || !e[r]) && n.push(`scenario ${t}: ${r} is not a non-empty string`);
	return e.synthetic === !0 ? (e.map_label !== "synthetic map (sensitivity study), not survey data" && n.push(`scenario ${t}: synthetic map_label != '${Kt}'`), String(e.map_caption).includes("synthetic map (sensitivity study), not survey data") || n.push(`scenario ${t}: synthetic map_caption lacks '${Kt}'`)) : (String(e.map_label).includes("synthetic map (sensitivity study), not survey data") || String(e.map_caption).includes("synthetic map (sensitivity study), not survey data")) && n.push(`scenario ${t}: non-synthetic scenario carries the synthetic label`), n;
}
function fn(e) {
	if (!on(e)) return ["scenario entry is not an object"];
	let t = e.id, n = nn.filter((t) => !(t in e));
	if (n.length) return [`scenario ${t}: missing ${n.join(", ")}`];
	let r = dn(e, t);
	return Array.isArray(e.notes) || r.push(`scenario ${t}: notes is not a list`), r.push(...un(e.line, `scenario ${t} line`)), r;
}
function pn(e) {
	if (!on(e)) return ["artifact is not an object"];
	let t = [];
	e.schema_version !== 2 && t.push(`schema_version ${e.schema_version} != 2`), e.kind !== "uav_run" && t.push(`kind ${e.kind} != ${qt}`);
	for (let n of tn) n in e || t.push(`missing top-level key ${n}`);
	JSON.stringify(e.estimators) !== JSON.stringify(Yt) && t.push("estimators list differs"), Yt.includes(e.default_estimator) || t.push("default_estimator not in estimators"), cn(e.model_sha256) || t.push("model_sha256 is not 64 hex characters");
	let n = on(e.motor) ? e.motor : {};
	for (let e of an) e in n || t.push(`motor missing ${e}`);
	ln(n.seed_str) || t.push("motor.seed_str is not a digit string");
	let r = Array.isArray(e.scenarios) ? e.scenarios : [];
	Array.isArray(e.scenarios) || t.push("scenarios is not a list");
	let i = r.map((e) => on(e) ? e.id : null);
	JSON.stringify(i) !== JSON.stringify(Zt) && t.push(`scenario ids ${i.join(",")} != ${Zt.join(",")}`), i.includes(e.default_scenario) || t.push(`default_scenario ${e.default_scenario} not among scenario ids`);
	for (let e of r) t.push(...fn(e));
	let a = e.comparison;
	return on(a) ? (Array.isArray(a.rows) || t.push("comparison.rows is not a list"), typeof a.statement != "string" && t.push("comparison.statement is not a string"), typeof a.rule != "string" && t.push("comparison.rule is not a string"), (typeof a.verdict != "string" || !a.verdict) && t.push("comparison.verdict is not a string")) : t.push("comparison missing"), t;
}
function mn(e) {
	if (!on(e)) return ["live payload is not an object"];
	let t = [];
	e.kind !== "uav_live" && t.push(`kind ${e.kind} != ${Jt}`);
	let n = e.scenario;
	on(n) ? (Zt.includes(n.id) || t.push(`scenario id ${n.id} unknown`), t.push(...dn(n, n.id)), t.push(...un(n.line, `scenario ${n.id} line`))) : t.push("scenario is not an object");
	let r = on(e.motor) ? e.motor : {};
	for (let e of an) e in r || t.push(`motor missing ${e}`);
	ln(r.seed_str) || t.push("motor.seed_str is not a digit string"), typeof r.seed_hex == "string" && /^[0-9a-f]{16}$/.test(r.seed_hex) ? ln(r.seed_str) && BigInt(`0x${r.seed_hex}`).toString() !== r.seed_str && t.push("motor.seed_hex and motor.seed_str differ") : t.push("motor.seed_hex is not 16 lowercase hex characters"), (!Number.isInteger(e.S) || e.S <= 0) && t.push("S is not a positive integer"), cn(e.model_sha256) || t.push("model_sha256 is not 64 hex characters");
	let i = e.quantum_job;
	return i == null ? i === void 0 && t.push("quantum_job missing (null allowed)") : on(i) ? (i.job_id || t.push("quantum_job.job_id missing"), $t.includes(i.bits_label) || t.push(`quantum_job.bits_label ${i.bits_label} invalid`), en.includes(i.c_n_source) || t.push(`quantum_job.c_n_source ${i.c_n_source} invalid`), i.seed_hex !== r.seed_hex && t.push("quantum_job.seed_hex differs from motor.seed_hex")) : t.push("quantum_job is not an object"), t;
}
function hn(e, t) {
	return (e?.scenarios ?? []).find((e) => e.id === t) ?? null;
}
function gn(e) {
	return e.metric_start_index * e.jam.t / e.jam.index;
}
function _n(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] < t - 1e-9 ? n = i + 1 : r = i;
	}
	return Math.min(n, e.length - 1);
}
var vn = /* @__PURE__ */ new WeakMap();
function yn(e) {
	let t = vn.get(e);
	return t || (t = Wt(e.nT, e.valid), vn.set(e, t)), t;
}
function bn(e) {
	let t = e.line, n = t.t, r = gn(t), i = {};
	for (let e of Yt) {
		let n = t.estimates[e];
		i[e] = {
			x: n.x,
			y: n.y,
			signal: n.signal_nT,
			windowT: n.window_t,
			ncc: n.ncc,
			accepted: n.accepted
		};
	}
	let a = t.map_preview;
	return {
		id: e.id,
		label: e.label,
		mapLabel: e.map_label,
		mapCaption: e.map_caption,
		synthetic: e.synthetic === !0,
		notes: e.notes ?? [],
		mapSha: e.map?.sha256 ?? "",
		t: n,
		n: n.length,
		tEnd: n[n.length - 1],
		jamIdx: t.jam.display_index,
		jamDisplayIndex: t.jam.display_index,
		jamT: t.jam.t,
		metricStartT: r,
		metricStartIdx: _n(n, r),
		metricStartDisplayIndex: _n(n, r),
		truth: {
			x: t.truth.x,
			y: t.truth.y,
			anomaly: t.truth.anomaly_nT
		},
		dr: {
			x: t.dead_reckoning.x,
			y: t.dead_reckoning.y
		},
		est: i,
		metrics: t.metrics,
		sensor: t.sensor,
		preview: a,
		domain: yn(a),
		extentKm: {
			w: (a.x_max - a.x_min) / 1e3,
			h: (a.y_max - a.y_min) / 1e3
		},
		hasInvalid: a.valid.some((e) => !e),
		frame: t.frame
	};
}
function xn(e, t, n) {
	let r = e.est[t];
	return r ? Math.hypot(r.x[n] - e.truth.x[n], r.y[n] - e.truth.y[n]) : null;
}
function Sn(e, t) {
	return Math.hypot(e.dr.x[t] - e.truth.x[t], e.dr.y[t] - e.truth.y[t]);
}
var Cn = [
	{
		key: "signal_rmse_nT",
		label: "Signal RMSE (nT)"
	},
	{
		key: "cep50_m",
		label: "CEP50 (m)"
	},
	{
		key: "cep95_m",
		label: "CEP95 (m)"
	},
	{
		key: "pct_under_556",
		label: "Under {t} m (%)"
	},
	{
		key: "matches_lost",
		label: "TERCOM matches lost"
	}
], wn = /* @__PURE__ */ new Set([
	"cep50_m",
	"cep95_m",
	"pct_under_556"
]);
function Tn(e) {
	let t = e?.comparison;
	if (!on(t) || !Array.isArray(t.rows)) return null;
	let n = (e.scenarios ?? []).map((e) => ({
		id: e.id,
		label: e.label,
		mapLabel: e.map_label
	})), r = Array.isArray(e.thresholds_m) ? e.thresholds_m[0] : "", i = (e, n) => t.rows.find((t) => t.scenario === e && t.estimator === n) ?? null;
	return {
		columns: n,
		groups: Qt.map((e) => ({
			estimator: e,
			rows: Cn.filter((t) => e !== "dead_reckoning" || wn.has(t.key)).map((t) => ({
				key: t.key,
				label: t.label.replace("{t}", String(r)),
				cells: n.map((n) => {
					let r = i(n.id, e);
					return r ? {
						value: r[t.key] ?? null,
						windows: r.windows ?? null
					} : {
						value: null,
						windows: null
					};
				})
			}))
		})),
		statement: t.statement,
		verdict: t.verdict,
		rule: t.rule
	};
}
//#endregion
//#region src/components/JamBanner.jsx
function En({ view: e }) {
	let t = T();
	return !e || t < e.jamIdx ? null : /* @__PURE__ */ (0, M.jsx)("p", {
		className: "jam-banner",
		children: `GPS jammed at t = ${A(e.jamT)} s — magnetic map matching only from here`
	});
}
//#endregion
//#region src/theme.js
var Dn = {
	key: "truth",
	label: "True path",
	color: "#F5F5F5",
	dash: "",
	mapDash: "",
	marker: "uav"
}, On = {
	key: "dead_reckoning",
	label: "Dead reckoning (INS only)",
	color: "#009E73",
	dash: null,
	mapDash: "1 4",
	marker: "square"
}, kn = {
	baseline_ls: {
		key: "baseline_ls",
		label: "Baseline: magnetometer + notch",
		short: "Baseline",
		color: "#D55E00",
		dash: "8 4",
		mapDash: "8 5",
		marker: "triangle"
	},
	baseline_mean: {
		key: "baseline_mean",
		label: "Baseline variant: block mean",
		short: "Block mean",
		color: null,
		dash: null,
		mapDash: null,
		marker: null
	},
	quantum_q1: {
		key: "quantum_q1",
		label: "Quantum: single-qubit Ramsey",
		short: "Single-qubit",
		color: "#56B4E9",
		dash: "2 3",
		mapDash: "10 3 2 3",
		marker: "diamond"
	},
	quantum_ghz4: {
		key: "quantum_ghz4",
		label: "Quantum: GHZ-4 entangled",
		short: "GHZ-4 entangled",
		color: "#CC79A7",
		dash: "10 3 2 3",
		mapDash: "10 3 2 3",
		marker: "circle"
	},
	truth: Dn,
	dead_reckoning: On
}, An = [
	"dead_reckoning",
	"baseline_ls",
	"baseline_mean",
	"quantum_q1",
	"quantum_ghz4"
], jn = "#E69F00", Mn = "#FFD166", Nn = "#000000", Pn = "#24282F", Fn = "#3A3F47", In = "#E8EAED", Ln = "#3A404C", Rn = "#A9B0BB", zn = "#A5B4FC", Bn = "baseline_ls", Vn = 1.096, Hn = 300, Un = 520, Wn = 700, Gn = 160, Kn = 12, qn = 28, Jn = 12, Yn = 12, Xn = null, Zn = () => (Xn ||= Ut(), Xn);
function Qn(e) {
	let t = parseInt(e.slice(1), 16);
	return [
		t >> 16 & 255,
		t >> 8 & 255,
		t & 255
	];
}
function $n(e) {
	let t = document.createElement("canvas");
	t.width = 4, t.height = 4;
	let n = t.getContext("2d"), r = n.createImageData(4, 4), [i, a, o] = Qn(Fn);
	for (let e = 0; e < 4; e++) {
		let t = ((3 - e) * 4 + e) * 4;
		r.data[t] = i, r.data[t + 1] = a, r.data[t + 2] = o, r.data[t + 3] = 255;
	}
	return n.putImageData(r, 0, 0), e.createPattern(t, "repeat");
}
function er(e, t, n, r) {
	e.width = Math.max(1, Math.round(t * r)), e.height = Math.max(1, Math.round(n * r)), e.style.width = `${t}px`, e.style.height = `${n}px`;
	let i = e.getContext("2d");
	return i.setTransform(r, 0, 0, r, 0, 0), i;
}
function tr(e, t, [n, r], i, a, o) {
	let { nx: s, ny: c, nT: l, valid: u } = t, d = Zn(), f = Qn(Pn), p = document.createElement("canvas");
	p.width = s, p.height = c;
	let m = p.getContext("2d"), h = m.createImageData(s, c), g = r - n;
	for (let e = 0; e < c; e++) for (let t = 0; t < s; t++) {
		let r = e * s + t, i = ((c - 1 - e) * s + t) * 4;
		if (!u[r]) h.data[i] = f[0], h.data[i + 1] = f[1], h.data[i + 2] = f[2];
		else {
			let e = Math.max(0, Math.min(255, Math.round((l[r] - n) / g * 255)));
			h.data[i] = d[3 * e], h.data[i + 1] = d[3 * e + 1], h.data[i + 2] = d[3 * e + 2];
		}
		h.data[i + 3] = 255;
	}
	m.putImageData(h, 0, 0);
	let _ = er(e, i, a, o);
	_.imageSmoothingEnabled = !1, _.clearRect(0, 0, i, a), _.drawImage(p, 0, 0, i, a);
	let v = i / s, y = a / c, b = new Path2D(), x = !1;
	for (let e = 0; e < c; e++) {
		let t = c - 1 - e, n = 0;
		for (; n < s;) {
			if (u[e * s + n]) {
				n += 1;
				continue;
			}
			let r = n;
			for (; n < s && !u[e * s + n];) n += 1;
			b.rect(r * v, t * y, (n - r) * v, y), x = !0;
		}
	}
	x && (_.fillStyle = $n(_), _.fill(b));
}
function nr(e, t) {
	let n = Zn(), r = document.createElement("canvas");
	r.width = 256, r.height = 1;
	let i = r.getContext("2d"), a = i.createImageData(256, 1);
	for (let e = 0; e < 256; e++) a.data[4 * e] = n[3 * e], a.data[4 * e + 1] = n[3 * e + 1], a.data[4 * e + 2] = n[3 * e + 2], a.data[4 * e + 3] = 255;
	i.putImageData(a, 0, 0);
	let o = er(e, Gn, Kn, t);
	o.imageSmoothingEnabled = !0, o.drawImage(r, 0, 0, Gn, Kn);
}
function rr(e, t) {
	let n = er(e, qn, Jn, t);
	n.fillStyle = Pn, n.fillRect(0, 0, qn, Jn), n.fillStyle = $n(n), n.fillRect(0, 0, qn, Jn);
}
function ir(e) {
	let [t, n] = (0, y.useState)({
		width: 0,
		dpr: 1
	});
	return (0, y.useEffect)(() => {
		let t = e.current;
		if (!t) return;
		let r = () => {
			let e = Math.floor(t.getBoundingClientRect().width), r = window.devicePixelRatio || 1;
			n((t) => t.width === e && t.dpr === r ? t : {
				width: e,
				dpr: r
			});
		}, i = new ResizeObserver(r);
		i.observe(t);
		let a = null, o = () => {
			r(), s();
		};
		function s() {
			a && a.removeEventListener("change", o), a = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`), a.addEventListener("change", o);
		}
		return s(), r(), () => {
			i.disconnect(), a && a.removeEventListener("change", o);
		};
	}, [e]), t;
}
function ar({ points: e, color: t, dash: n, width: r = 2, round: i = !1 }) {
	return e ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("polyline", {
		points: e,
		fill: "none",
		stroke: Nn,
		strokeWidth: 4,
		strokeLinejoin: "round",
		strokeLinecap: "round"
	}), /* @__PURE__ */ (0, M.jsx)("polyline", {
		points: e,
		fill: "none",
		stroke: t,
		strokeWidth: r,
		strokeDasharray: n || void 0,
		strokeLinejoin: "round",
		strokeLinecap: i ? "round" : "butt"
	})] }) : null;
}
function or({ shape: e, x: t, y: n, color: r, size: i = Yn }) {
	let a = i / 2, o = {
		fill: r,
		stroke: Nn,
		strokeWidth: 1.5
	};
	switch (e) {
		case "square": return /* @__PURE__ */ (0, M.jsx)("rect", {
			x: t - a,
			y: n - a,
			width: i,
			height: i,
			...o
		});
		case "triangle": return /* @__PURE__ */ (0, M.jsx)("polygon", {
			points: `${t},${n - a} ${t + a},${n + a} ${t - a},${n + a}`,
			...o
		});
		case "diamond": return /* @__PURE__ */ (0, M.jsx)("polygon", {
			points: `${t},${n - a} ${t + a},${n} ${t},${n + a} ${t - a},${n}`,
			...o
		});
		case "circle": return /* @__PURE__ */ (0, M.jsx)("circle", {
			cx: t,
			cy: n,
			r: a,
			...o
		});
		default: return null;
	}
}
function sr({ x: e, y: t, angle: n }) {
	return /* @__PURE__ */ (0, M.jsx)("g", {
		transform: `translate(${e} ${t}) rotate(${n})`,
		children: /* @__PURE__ */ (0, M.jsx)("path", {
			d: "M0 -11 L2 -4 L11 1 L11 3 L2 1 L1.5 7 L5 10 L5 11.5 L0 10 L-5 11.5 L-5 10 L-1.5 7 L-2 1 L-11 3 L-11 1 L-2 -4 Z",
			fill: Dn.color,
			stroke: Nn,
			strokeWidth: 1.5,
			strokeLinejoin: "round"
		})
	});
}
function cr({ x: e, y: t, W: n }) {
	let r = e > n - 110, i = "M-4 -4L4 4M4 -4L-4 4";
	return /* @__PURE__ */ (0, M.jsxs)("g", {
		transform: `translate(${e} ${t})`,
		children: [
			/* @__PURE__ */ (0, M.jsx)("circle", {
				r: 8,
				fill: "none",
				stroke: Nn,
				strokeWidth: 4
			}),
			/* @__PURE__ */ (0, M.jsx)("path", {
				d: i,
				stroke: Nn,
				strokeWidth: 4,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, M.jsx)("circle", {
				r: 8,
				fill: "none",
				stroke: Mn,
				strokeWidth: 2
			}),
			/* @__PURE__ */ (0, M.jsx)("path", {
				d: i,
				stroke: Mn,
				strokeWidth: 2,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, M.jsx)("text", {
				x: r ? -13 : 13,
				y: 5,
				textAnchor: r ? "end" : "start",
				fontSize: 14,
				fill: In,
				stroke: Nn,
				strokeWidth: 3,
				paintOrder: "stroke",
				strokeLinejoin: "round",
				children: "GPS jammed"
			})
		]
	});
}
function lr(e, t) {
	let n = e[Math.max(0, t - 1)], r = e[Math.min(e.length - 1, Math.max(1, t))], i = r[0] - n[0], a = r[1] - n[1];
	return i === 0 && a === 0 ? 0 : Math.atan2(i, -a) * 180 / Math.PI;
}
var ur = (0, y.memo)(function({ W: e, H: t, px: n, jamIdx: r, quantum: i }) {
	let a = T(), o = Math.min(a, n.truth.xy.length - 1), s = o >= r, c = (e, t) => e.slice(t, o + 1).join(" "), [l, u] = n.truth.xy[o], d = n.dr.xy[o], f = n.base.xy[o], p = n.q.xy[o], m = n.truth.xy[r], h = kn[Bn];
	return /* @__PURE__ */ (0, M.jsxs)("svg", {
		className: "map-overlay",
		viewBox: `0 0 ${e} ${t}`,
		width: e,
		height: t,
		"aria-hidden": "true",
		focusable: "false",
		children: [
			/* @__PURE__ */ (0, M.jsx)(ar, {
				points: c(n.truth.str, 0),
				color: Dn.color,
				dash: ""
			}),
			s && /* @__PURE__ */ (0, M.jsx)(ar, {
				points: c(n.dr.str, r),
				color: On.color,
				dash: On.mapDash,
				width: 2.5,
				round: !0
			}),
			s && /* @__PURE__ */ (0, M.jsx)(ar, {
				points: c(n.base.str, r),
				color: h.color,
				dash: h.mapDash
			}),
			s && /* @__PURE__ */ (0, M.jsx)(ar, {
				points: c(n.q.str, r),
				color: i.color,
				dash: i.mapDash
			}),
			s && /* @__PURE__ */ (0, M.jsx)(cr, {
				x: m[0],
				y: m[1],
				W: e
			}),
			s && /* @__PURE__ */ (0, M.jsx)(or, {
				shape: On.marker,
				x: d[0],
				y: d[1],
				color: On.color
			}),
			s && /* @__PURE__ */ (0, M.jsx)(or, {
				shape: h.marker,
				x: f[0],
				y: f[1],
				color: h.color
			}),
			s && /* @__PURE__ */ (0, M.jsx)(or, {
				shape: i.marker,
				x: p[0],
				y: p[1],
				color: i.color
			}),
			/* @__PURE__ */ (0, M.jsx)(sr, {
				x: l,
				y: u,
				angle: lr(n.truth.xy, o)
			})
		]
	});
}), dr = (0, y.memo)(function({ view: e, quantumKey: t }) {
	let n = T(), r = kn[t].label, i = Math.min(n, e.n - 1), a;
	if (i < e.jamIdx) a = /* @__PURE__ */ (0, M.jsx)("p", {
		className: "readout-state",
		children: "GPS available"
	});
	else if (i < e.metricStartIdx) a = /* @__PURE__ */ (0, M.jsx)("p", {
		className: "readout-state",
		children: "Collecting first map-matching window…"
	});
	else {
		let n = xn(e, t, i);
		a = /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("p", {
			className: "readout-value",
			children: n === null ? "n/a" : `${k(n)} m`
		}), /* @__PURE__ */ (0, M.jsx)("p", {
			className: "readout-sub",
			children: `Baseline ${k(xn(e, Bn, i))} m · Dead reckoning ${k(Sn(e, i))} m`
		})] });
	}
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "error-readout",
		children: [/* @__PURE__ */ (0, M.jsx)("p", {
			className: "readout-label",
			children: `Position error, ${r}`
		}), a]
	});
}), fr = 8;
function pr(e, t, [n, r]) {
	if (t === 0 || t === e.length - 1) return !0;
	let i = (e) => (e - n) / (r - n) * Gn, a = e[t].label.length * fr / 2 + 4, o = i(e[0].value) + e[0].label.length * fr, s = e[e.length - 1], c = i(s.value) - s.label.length * fr, l = i(e[t].value);
	return l - a >= o && l + a <= c;
}
function mr(e, t, n) {
	let r = Array(e.length), i = Array(e.length);
	for (let a = 0; a < e.length; a++) {
		let o = n(e[a], t[a]);
		r[a] = o, i[a] = `${o[0].toFixed(1)},${o[1].toFixed(1)}`;
	}
	return {
		xy: r,
		str: i
	};
}
function hr({ series: e, shape: t, dash: n, jam: r = !1 }) {
	return /* @__PURE__ */ (0, M.jsx)("svg", {
		width: qn,
		height: Jn,
		viewBox: `0 0 ${qn} ${Jn}`,
		"aria-hidden": "true",
		focusable: "false",
		className: "legend-swatch",
		children: r ? /* @__PURE__ */ (0, M.jsxs)("g", {
			transform: `translate(${qn / 2} ${Jn / 2})`,
			children: [/* @__PURE__ */ (0, M.jsx)("circle", {
				r: 5,
				fill: "none",
				stroke: Mn,
				strokeWidth: 2
			}), /* @__PURE__ */ (0, M.jsx)("path", {
				d: "M-3 -3L3 3M3 -3L-3 3",
				stroke: Mn,
				strokeWidth: 1.5,
				strokeLinecap: "round"
			})]
		}) : /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
			/* @__PURE__ */ (0, M.jsx)("line", {
				x1: "1",
				y1: Jn / 2,
				x2: 27,
				y2: Jn / 2,
				stroke: Nn,
				strokeWidth: 4
			}),
			/* @__PURE__ */ (0, M.jsx)("line", {
				x1: "1",
				y1: Jn / 2,
				x2: 27,
				y2: Jn / 2,
				stroke: e.color,
				strokeWidth: 2,
				strokeDasharray: n || void 0,
				strokeLinecap: e.key === On.key ? "round" : "butt"
			}),
			t && /* @__PURE__ */ (0, M.jsx)(or, {
				shape: t,
				x: qn / 2,
				y: Jn / 2,
				color: e.color,
				size: 8
			})
		] })
	});
}
function gr({ view: e, quantumKey: t }) {
	let n = (0, y.useRef)(null), r = (0, y.useRef)(null), i = (0, y.useRef)(null), a = (0, y.useRef)(null), { width: o, dpr: s } = ir(n), c = e.preview, l = e.domain, u = (0, y.useMemo)(() => Gt(l), [l]), d = o > 0 ? Math.round(Math.min(o >= Wn ? Un : Hn, o * Vn)) : 0, f = (0, y.useMemo)(() => o > 0 ? z(c, o, d) : null, [
		c,
		o,
		d
	]), p = (0, y.useMemo)(() => {
		if (!f) return null;
		let n = e.est[t], r = e.est[Bn];
		return {
			truth: mr(e.truth.x, e.truth.y, f.toPx),
			dr: mr(e.dr.x, e.dr.y, f.toPx),
			base: mr(r.x, r.y, f.toPx),
			q: mr(n.x, n.y, f.toPx)
		};
	}, [
		e,
		t,
		f
	]);
	(0, y.useEffect)(() => {
		f && r.current && tr(r.current, c, l, f.W, f.H, s);
	}, [
		c,
		l,
		f,
		s
	]), (0, y.useEffect)(() => {
		i.current && nr(i.current, s), a.current && rr(a.current, s);
	}, [s, e.hasInvalid]);
	let m = kn[t], h = kn[Bn], [g, _] = l;
	return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
		/* @__PURE__ */ (0, M.jsxs)("div", {
			className: "map-stage",
			ref: n,
			style: d ? { height: `${d}px` } : void 0,
			children: [f && p && /* @__PURE__ */ (0, M.jsxs)("div", {
				className: "map-plot",
				style: {
					width: `${f.W}px`,
					height: `${f.H}px`
				},
				children: [/* @__PURE__ */ (0, M.jsx)("canvas", {
					ref: r,
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, M.jsx)(ur, {
					W: f.W,
					H: f.H,
					px: p,
					jamIdx: e.jamIdx,
					quantum: m
				})]
			}), /* @__PURE__ */ (0, M.jsx)(dr, {
				view: e,
				quantumKey: t
			})]
		}),
		/* @__PURE__ */ (0, M.jsx)("div", {
			className: "jam-slot",
			children: /* @__PURE__ */ (0, M.jsx)(En, { view: e })
		}),
		/* @__PURE__ */ (0, M.jsxs)("ul", {
			className: "map-legend",
			children: [
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(hr, {
						series: Dn,
						dash: ""
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: Dn.label })]
				}),
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(hr, {
						series: On,
						shape: On.marker,
						dash: On.mapDash
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: On.label })]
				}),
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(hr, {
						series: h,
						shape: h.marker,
						dash: h.mapDash
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: h.label })]
				}),
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(hr, {
						series: m,
						shape: m.marker,
						dash: m.mapDash
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: m.label })]
				}),
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(hr, {
						series: Dn,
						jam: !0
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: "GPS jammed" })]
				}),
				/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "colorbar",
					children: [
						/* @__PURE__ */ (0, M.jsx)("span", { children: "Magnetic anomaly (nT)" }),
						/* @__PURE__ */ (0, M.jsx)("canvas", {
							ref: i,
							className: "colorbar-canvas",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, M.jsx)("div", {
							className: "colorbar-ticks",
							children: u.map((e, t) => /* @__PURE__ */ (0, M.jsx)("span", {
								style: {
									left: `${(e.value - g) / (_ - g) * 100}%`,
									transform: t === 0 ? "none" : t === u.length - 1 ? "translateX(-100%)" : "translateX(-50%)"
								},
								children: pr(u, t, l) ? e.label : ""
							}, e.value))
						})
					]
				}),
				e.hasInvalid && /* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)("canvas", {
						ref: a,
						className: "legend-hatch",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, M.jsx)("span", { children: "No map data" })]
				})
			]
		})
	] });
}
function _r(e, t) {
	let n = kn[t], r = n.marker, i = (e) => e.toFixed(1);
	return `${e.mapCaption} Extent ${i(e.extentKm.w)} × ${i(e.extentKm.h)} km. True path solid white, dead reckoning dotted green, baseline dashed orange (triangle), ${n.label} dash-dot (${r}).`;
}
function vr({ view: e, quantumKey: t, loadingText: n = "Loading recorded flights…" }) {
	let r = (0, y.useId)();
	return /* @__PURE__ */ (0, M.jsxs)("figure", {
		className: "panel map-figure",
		role: "group",
		"aria-labelledby": r,
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, M.jsx)("h2", {
				id: r,
				children: "Map"
			}),
			/* @__PURE__ */ (0, M.jsx)("p", {
				className: "map-label-line",
				children: e ? e.mapLabel : ""
			}),
			e ? /* @__PURE__ */ (0, M.jsx)(gr, {
				view: e,
				quantumKey: t
			}) : /* @__PURE__ */ (0, M.jsx)("div", {
				className: "map-loading",
				children: n
			}),
			e && /* @__PURE__ */ (0, M.jsx)("figcaption", { children: _r(e, t) })
		]
	});
}
//#endregion
//#region src/components/ScenarioPicker.jsx
function yr({ scenarios: e, value: t, onChange: n, disabled: r = !1, lockHelp: i = null, focusRef: a = null }) {
	let o = (0, y.useId)(), s = `${o}-lock`, c = e.find((e) => e.id === t) ?? e[0] ?? null;
	return /* @__PURE__ */ (0, M.jsxs)("fieldset", {
		className: "picker",
		disabled: r,
		"aria-describedby": i ? s : void 0,
		children: [
			/* @__PURE__ */ (0, M.jsx)("legend", { children: "Map scenario" }),
			/* @__PURE__ */ (0, M.jsx)("div", {
				className: "picker-options",
				children: e.map((e, r) => {
					let i = `${o}-${r}`, s = `${i}-map`;
					return /* @__PURE__ */ (0, M.jsxs)("label", {
						className: "radio-row radio-row-tall",
						htmlFor: i,
						children: [/* @__PURE__ */ (0, M.jsx)("input", {
							id: i,
							type: "radio",
							name: `${o}-scenario`,
							value: e.id,
							checked: e.id === t,
							onChange: () => n(e.id),
							"aria-describedby": s,
							ref: e.id === t ? a : void 0
						}), /* @__PURE__ */ (0, M.jsxs)("span", {
							className: "radio-text",
							children: [/* @__PURE__ */ (0, M.jsx)("span", {
								className: "radio-main",
								children: e.label
							}), /* @__PURE__ */ (0, M.jsx)("span", {
								id: s,
								className: "radio-sub",
								children: e.map_label
							})]
						})]
					}, e.id);
				})
			}),
			i && /* @__PURE__ */ (0, M.jsx)("p", {
				id: s,
				className: "help",
				children: i
			}),
			c && /* @__PURE__ */ (0, M.jsxs)("details", {
				className: "scenario-notes",
				children: [
					/* @__PURE__ */ (0, M.jsx)("summary", { children: "Scenario notes" }),
					/* @__PURE__ */ (0, M.jsx)("ul", { children: (c.notes ?? []).map((e) => /* @__PURE__ */ (0, M.jsx)("li", { children: e }, e)) }),
					c.map?.sha256 && /* @__PURE__ */ (0, M.jsxs)("p", {
						className: "help",
						children: ["Map file sha256 ", /* @__PURE__ */ (0, M.jsx)("span", {
							className: "mono",
							children: String(c.map.sha256).slice(0, 12)
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/RunModePicker.jsx
var br = [{
	value: "live",
	label: "UAV (live, IonQ-drawn motor)"
}, {
	value: "replay",
	label: "UAV (recorded replay)"
}];
function xr({ value: e, onChange: t, disabled: n = !1 }) {
	let r = (0, y.useId)();
	return /* @__PURE__ */ (0, M.jsxs)("fieldset", {
		className: "picker",
		disabled: n,
		children: [/* @__PURE__ */ (0, M.jsx)("legend", { children: "Run mode" }), /* @__PURE__ */ (0, M.jsx)("div", {
			className: "picker-options",
			children: br.map((n) => {
				let i = `${r}-${n.value}`;
				return /* @__PURE__ */ (0, M.jsxs)("label", {
					className: "radio-row",
					htmlFor: i,
					children: [/* @__PURE__ */ (0, M.jsx)("input", {
						id: i,
						type: "radio",
						name: `${r}-mode`,
						value: n.value,
						checked: n.value === e,
						onChange: () => t(n.value)
					}), /* @__PURE__ */ (0, M.jsx)("span", {
						className: "radio-main",
						children: n.label
					})]
				}, n.value);
			})
		})]
	});
}
//#endregion
//#region src/components/QuantumTrackToggle.jsx
var Sr = [{
	value: "quantum_q1",
	label: "Single-qubit"
}, {
	value: "quantum_ghz4",
	label: "GHZ-4 entangled"
}];
function Cr({ value: e, onChange: t, disabled: n = !1 }) {
	let r = (0, y.useId)();
	return /* @__PURE__ */ (0, M.jsxs)("fieldset", {
		className: "picker",
		disabled: n,
		children: [/* @__PURE__ */ (0, M.jsx)("legend", { children: "Quantum track on map and charts" }), /* @__PURE__ */ (0, M.jsx)("div", {
			className: "picker-options picker-inline",
			children: Sr.map((n) => {
				let i = `${r}-${n.value}`;
				return /* @__PURE__ */ (0, M.jsxs)("label", {
					className: "radio-row",
					htmlFor: i,
					children: [/* @__PURE__ */ (0, M.jsx)("input", {
						id: i,
						type: "radio",
						name: `${r}-quantum`,
						value: n.value,
						checked: n.value === e,
						onChange: () => t(n.value)
					}), /* @__PURE__ */ (0, M.jsx)("span", {
						className: "radio-main",
						children: n.label
					})]
				}, n.value);
			})
		})]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function wr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = wr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Tr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = wr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/recharts/es6/util/excludeEventProps.js
var Er = /* @__PURE__ */ "dangerouslySetInnerHTML.onCopy.onCopyCapture.onCut.onCutCapture.onPaste.onPasteCapture.onCompositionEnd.onCompositionEndCapture.onCompositionStart.onCompositionStartCapture.onCompositionUpdate.onCompositionUpdateCapture.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onChangeCapture.onBeforeInput.onBeforeInputCapture.onInput.onInputCapture.onReset.onResetCapture.onSubmit.onSubmitCapture.onInvalid.onInvalidCapture.onLoad.onLoadCapture.onError.onErrorCapture.onKeyDown.onKeyDownCapture.onKeyPress.onKeyPressCapture.onKeyUp.onKeyUpCapture.onAbort.onAbortCapture.onCanPlay.onCanPlayCapture.onCanPlayThrough.onCanPlayThroughCapture.onDurationChange.onDurationChangeCapture.onEmptied.onEmptiedCapture.onEncrypted.onEncryptedCapture.onEnded.onEndedCapture.onLoadedData.onLoadedDataCapture.onLoadedMetadata.onLoadedMetadataCapture.onLoadStart.onLoadStartCapture.onPause.onPauseCapture.onPlay.onPlayCapture.onPlaying.onPlayingCapture.onProgress.onProgressCapture.onRateChange.onRateChangeCapture.onSeeked.onSeekedCapture.onSeeking.onSeekingCapture.onStalled.onStalledCapture.onSuspend.onSuspendCapture.onTimeUpdate.onTimeUpdateCapture.onVolumeChange.onVolumeChangeCapture.onWaiting.onWaitingCapture.onAuxClick.onAuxClickCapture.onClick.onClickCapture.onContextMenu.onContextMenuCapture.onDoubleClick.onDoubleClickCapture.onDrag.onDragCapture.onDragEnd.onDragEndCapture.onDragEnter.onDragEnterCapture.onDragExit.onDragExitCapture.onDragLeave.onDragLeaveCapture.onDragOver.onDragOverCapture.onDragStart.onDragStartCapture.onDrop.onDropCapture.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseMoveCapture.onMouseOut.onMouseOutCapture.onMouseOver.onMouseOverCapture.onMouseUp.onMouseUpCapture.onSelect.onSelectCapture.onTouchCancel.onTouchCancelCapture.onTouchEnd.onTouchEndCapture.onTouchMove.onTouchMoveCapture.onTouchStart.onTouchStartCapture.onPointerDown.onPointerDownCapture.onPointerMove.onPointerMoveCapture.onPointerUp.onPointerUpCapture.onPointerCancel.onPointerCancelCapture.onPointerEnter.onPointerEnterCapture.onPointerLeave.onPointerLeaveCapture.onPointerOver.onPointerOverCapture.onPointerOut.onPointerOutCapture.onGotPointerCapture.onGotPointerCaptureCapture.onLostPointerCapture.onLostPointerCaptureCapture.onScroll.onScrollCapture.onWheel.onWheelCapture.onAnimationStart.onAnimationStartCapture.onAnimationEnd.onAnimationEndCapture.onAnimationIteration.onAnimationIterationCapture.onTransitionEnd.onTransitionEndCapture".split(".");
function Dr(e) {
	return typeof e == "string" && Er.includes(e);
}
//#endregion
//#region node_modules/recharts/es6/util/svgPropertiesNoEvents.js
var Or = /* @__PURE__ */ new Set(/* @__PURE__ */ "aria-activedescendant.aria-atomic.aria-autocomplete.aria-busy.aria-checked.aria-colcount.aria-colindex.aria-colspan.aria-controls.aria-current.aria-describedby.aria-details.aria-disabled.aria-errormessage.aria-expanded.aria-flowto.aria-haspopup.aria-hidden.aria-invalid.aria-keyshortcuts.aria-label.aria-labelledby.aria-level.aria-live.aria-modal.aria-multiline.aria-multiselectable.aria-orientation.aria-owns.aria-placeholder.aria-posinset.aria-pressed.aria-readonly.aria-relevant.aria-required.aria-roledescription.aria-rowcount.aria-rowindex.aria-rowspan.aria-selected.aria-setsize.aria-sort.aria-valuemax.aria-valuemin.aria-valuenow.aria-valuetext.className.color.height.id.lang.max.media.method.min.name.style.target.width.role.tabIndex.accentHeight.accumulate.additive.alignmentBaseline.allowReorder.alphabetic.amplitude.arabicForm.ascent.attributeName.attributeType.autoReverse.azimuth.baseFrequency.baselineShift.baseProfile.bbox.begin.bias.by.calcMode.capHeight.clip.clipPath.clipPathUnits.clipRule.colorInterpolation.colorInterpolationFilters.colorProfile.colorRendering.contentScriptType.contentStyleType.cursor.cx.cy.d.decelerate.descent.diffuseConstant.direction.display.divisor.dominantBaseline.dur.dx.dy.edgeMode.elevation.enableBackground.end.exponent.externalResourcesRequired.fill.fillOpacity.fillRule.filter.filterRes.filterUnits.floodColor.floodOpacity.focusable.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.format.from.fx.fy.g1.g2.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.glyphRef.gradientTransform.gradientUnits.hanging.horizAdvX.horizOriginX.href.ideographic.imageRendering.in2.in.intercept.k1.k2.k3.k4.k.kernelMatrix.kernelUnitLength.kerning.keyPoints.keySplines.keyTimes.lengthAdjust.letterSpacing.lightingColor.limitingConeAngle.local.markerEnd.markerHeight.markerMid.markerStart.markerUnits.markerWidth.mask.maskContentUnits.maskUnits.mathematical.mode.numOctaves.offset.opacity.operator.order.orient.orientation.origin.overflow.overlinePosition.overlineThickness.paintOrder.panose1.pathLength.patternContentUnits.patternTransform.patternUnits.pointerEvents.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.r.radius.refX.refY.renderingIntent.repeatCount.repeatDur.requiredExtensions.requiredFeatures.restart.result.rotate.rx.ry.seed.shapeRendering.slope.spacing.specularConstant.specularExponent.speed.spreadMethod.startOffset.stdDeviation.stemh.stemv.stitchTiles.stopColor.stopOpacity.strikethroughPosition.strikethroughThickness.string.stroke.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.strokeMiterlimit.strokeOpacity.strokeWidth.surfaceScale.systemLanguage.tableValues.targetX.targetY.textAnchor.textDecoration.textLength.textRendering.to.transform.u1.u2.underlinePosition.underlineThickness.unicode.unicodeBidi.unicodeRange.unitsPerEm.vAlphabetic.values.vectorEffect.version.vertAdvY.vertOriginX.vertOriginY.vHanging.vIdeographic.viewTarget.visibility.vMathematical.widths.wordSpacing.writingMode.x1.x2.x.xChannelSelector.xHeight.xlinkActuate.xlinkArcrole.xlinkHref.xlinkRole.xlinkShow.xlinkTitle.xlinkType.xmlBase.xmlLang.xmlns.xmlnsXlink.xmlSpace.y1.y2.y.yChannelSelector.z.zoomAndPan.ref.key.angle".split("."));
function kr(e) {
	return typeof e == "string" && Or.has(e);
}
function Ar(e) {
	return typeof e == "string" && e.startsWith("data-");
}
function jr(e) {
	if (typeof e != "object" || !e) return {};
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (kr(n) || Ar(n)) && (t[n] = e[n]);
	return t;
}
function Mr(e) {
	if (e == null) return null;
	if (/*#__PURE__*/ (0, y.isValidElement)(e) && typeof e.props == "object" && e.props !== null) {
		var t = e.props;
		return jr(t);
	}
	return typeof e == "object" && !Array.isArray(e) ? jr(e) : null;
}
//#endregion
//#region node_modules/recharts/es6/util/svgPropertiesAndEvents.js
function Nr(e) {
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (kr(n) || Ar(n) || Dr(n)) && (t[n] = e[n]);
	return t;
}
function Pr(e) {
	return e == null ? null : /*#__PURE__*/ (0, y.isValidElement)(e) ? Nr(e.props) : typeof e == "object" && !Array.isArray(e) ? Nr(e) : null;
}
//#endregion
//#region node_modules/recharts/es6/container/Surface.js
var Fr = [
	"children",
	"width",
	"height",
	"viewBox",
	"className",
	"style",
	"title",
	"desc"
];
function Ir() {
	return Ir = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Ir.apply(null, arguments);
}
function Lr(e, t) {
	if (e == null) return {};
	var n, r, i = Rr(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Rr(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var zr = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = e.width, i = e.height, a = e.viewBox, o = e.className, s = e.style, c = e.title, l = e.desc, u = Lr(e, Fr), d = a || {
		width: r,
		height: i,
		x: 0,
		y: 0
	}, f = Tr("recharts-surface", o);
	return /*#__PURE__*/ y.createElement("svg", Ir({}, Nr(u), {
		className: f,
		width: r,
		height: i,
		style: s,
		viewBox: `${d.x} ${d.y} ${d.width} ${d.height}`,
		ref: t
	}), /*#__PURE__*/ y.createElement("title", null, c), /*#__PURE__*/ y.createElement("desc", null, l), n);
}), Br = ["children", "className"];
function Vr() {
	return Vr = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Vr.apply(null, arguments);
}
function Hr(e, t) {
	if (e == null) return {};
	var n, r, i = Ur(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Ur(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Wr = /*#__PURE__*/ y.forwardRef((e, t) => {
	var n = e.children, r = e.className, i = Hr(e, Br), a = Tr("recharts-layer", r);
	return /*#__PURE__*/ y.createElement("g", Vr({ className: a }, Nr(i), { ref: t }), n);
});
//#endregion
//#region node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function Gr(e) {
	return e === "__proto__";
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
var Kr = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function qr(e) {
	switch (typeof e) {
		case "number":
		case "symbol": return !1;
		case "string": return e === "" || e.startsWith(".") || e.endsWith(".") ? !1 : Kr.test(e);
		default: return !1;
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
function Jr(e) {
	return typeof e == "string" || typeof e == "symbol" ? e : Object.is(e?.valueOf?.(), -0) ? "-0" : String(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function Yr(e) {
	return typeof e == "symbol" || e instanceof Symbol;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toString.mjs
function Xr(e) {
	return e == null ? "" : Zr(e);
}
function Zr(e) {
	if (typeof e == "string") return e;
	if (Array.isArray(e)) return e.map(Zr).join(",");
	if (Yr(e)) return e.toString();
	let t = e + "";
	return t === "0" && Object.is(Number(e), -0) ? "-0" : t;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toPath.mjs
function Qr(e) {
	if (Array.isArray(e)) return e.map(Jr);
	if (typeof e == "symbol") return [e];
	e = Xr(e);
	let t = [], n = e.length;
	if (n === 0) return t;
	let r = 0, i = "", a = "", o = !1, s = !1, c = /^-?\d+(?:\.\d+)?$/;
	for (e.charCodeAt(0) === 46 && t.push(""); r < n;) {
		let l = e[r];
		if (a) l === "\\" && r + 1 < n ? (r++, i += e[r]) : l === a ? a = "" : i += l;
		else if (o) {
			if (l === "\"" || l === "'") a = l, s = !0;
			else if (l === "]") {
				if (o = !1, !s && i.includes(".") && !c.test(i)) {
					let e = i.split(".");
					for (let n = 0; n < e.length; n++) e[n] !== "" && t.push(e[n]);
				} else t.push(i);
				i = "";
			} else i += l;
		} else if (l === "[") o = !0, s = !1, i &&= (t.push(i), "");
		else if (l === ".") {
			i &&= (t.push(i), "");
			let n = e[r + 1];
			(n === void 0 || n === ".") && t.push("");
		} else i += l;
		r++;
	}
	return i && t.push(i), t;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/get.mjs
function $r(e, t, n) {
	if (e == null) return n;
	switch (typeof t) {
		case "string": {
			if (Gr(t)) return n;
			let r = e[t];
			return r === void 0 ? qr(t) && !Object.hasOwn(e, t) ? $r(e, Qr(t), n) : n : r;
		}
		case "number":
		case "symbol": {
			typeof t == "number" && (t = Jr(t));
			let r = e[t];
			return r === void 0 ? n : r;
		}
		default: {
			if (Array.isArray(t)) return ei(e, t, n);
			if (t = Object.is(t?.valueOf(), -0) ? "-0" : String(t), Gr(t)) return n;
			let r = e[t];
			return r === void 0 ? n : r;
		}
	}
}
function ei(e, t, n) {
	if (t.length === 0) return n;
	let r = e;
	for (let e = 0; e < t.length; e++) {
		if (r == null || Gr(t[e])) return n;
		r = r[t[e]];
	}
	return r === void 0 ? n : r;
}
//#endregion
//#region node_modules/recharts/es6/util/round.js
var ti = 4;
function ni(e) {
	var t = 10 ** (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : ti), n = Math.round(e * t) / t;
	return Object.is(n, -0) ? 0 : n;
}
function ri(e) {
	var t = [...arguments].slice(1);
	return e.reduce((e, n, r) => {
		var i = t[r - 1];
		return typeof i == "string" ? e + i + n : i === void 0 ? e + n : e + ni(i) + n;
	}, "");
}
//#endregion
//#region node_modules/recharts/es6/util/DataUtils.js
var ii = (e) => e === 0 ? 0 : e > 0 ? 1 : -1, ai = (e) => typeof e == "number" && e != +e, oi = (e) => typeof e == "string" && e.length > 1 && e.indexOf("%") === e.length - 1, B = (e) => (typeof e == "number" || e instanceof Number) && !ai(e), si = (e) => B(e) || typeof e == "string", ci = 0, li = (e) => {
	var t = ++ci;
	return `${e || ""}${t}`;
}, ui = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, r = arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
	if (!B(e) && typeof e != "string") return n;
	var i;
	if (oi(e)) {
		if (t == null) return n;
		var a = e.indexOf("%");
		i = t * parseFloat(e.slice(0, a)) / 100;
	} else i = +e;
	return ai(i) && (i = n), r && t != null && i > t && (i = t), i;
}, di = (e) => {
	if (!Array.isArray(e)) return !1;
	for (var t = e.length, n = {}, r = 0; r < t; r++) if (!n[String(e[r])]) n[String(e[r])] = !0;
	else return !0;
	return !1;
};
function fi(e, t, n) {
	return B(e) && B(t) ? ni(e + n * (t - e)) : t;
}
function pi(e, t, n) {
	if (e && e.length) return e.find((e) => e && (typeof t == "function" ? t(e) : $r(e, t)) === n);
}
var mi = (e) => e == null, hi = (e) => mi(e) ? e : `${e.charAt(0).toUpperCase()}${e.slice(1)}`;
function gi(e) {
	return e != null;
}
function _i() {}
//#endregion
//#region node_modules/recharts/es6/cartesian/cartesianViewBoxToTrapezoid.js
function vi(e) {
	if (e) return {
		x: e.x,
		y: e.y,
		upperWidth: "upperWidth" in e ? e.upperWidth : e.width,
		lowerWidth: "lowerWidth" in e ? e.lowerWidth : e.width,
		width: e.width,
		height: e.height
	};
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getCartesianPosition.js
function yi(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bi(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yi(Object(n), !0).forEach(function(t) {
			xi(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yi(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xi(e, t, n) {
	return (t = Si(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Si(e) {
	var t = Ci(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Ci(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var wi = (e) => {
	var t = e.viewBox, n = e.position, r = e.offset, i = r === void 0 ? 0 : r, a = e.parentViewBox, o = e.clamp, s = vi(t), c = s.x, l = s.y, u = s.height, d = s.upperWidth, f = s.lowerWidth, p = c, m = c + (d - f) / 2, h = (p + m) / 2, g = (d + f) / 2, _ = p + d / 2, v = u >= 0 ? 1 : -1, y = v * i, b = v > 0 ? "end" : "start", x = v > 0 ? "start" : "end", S = d >= 0 ? 1 : -1, C = S * i, w = S > 0 ? "end" : "start", T = S > 0 ? "start" : "end", E = a;
	if (n === "top") {
		var D = {
			x: p + d / 2,
			y: l - y,
			horizontalAnchor: "middle",
			verticalAnchor: b
		};
		return o && E && (D.height = Math.max(l - E.y, 0), D.width = d), D;
	}
	if (n === "bottom") {
		var O = {
			x: m + f / 2,
			y: l + u + y,
			horizontalAnchor: "middle",
			verticalAnchor: x
		};
		return o && E && (O.height = Math.max(E.y + E.height - (l + u), 0), O.width = f), O;
	}
	if (n === "left") {
		var k = {
			x: h - C,
			y: l + u / 2,
			horizontalAnchor: w,
			verticalAnchor: "middle"
		};
		return o && E && (k.width = Math.max(k.x - E.x, 0), k.height = u), k;
	}
	if (n === "right") {
		var A = {
			x: h + g + C,
			y: l + u / 2,
			horizontalAnchor: T,
			verticalAnchor: "middle"
		};
		return o && E && (A.width = Math.max(E.x + E.width - A.x, 0), A.height = u), A;
	}
	var j = o && E ? {
		width: g,
		height: u
	} : {};
	return n === "insideLeft" ? bi({
		x: h + C,
		y: l + u / 2,
		horizontalAnchor: T,
		verticalAnchor: "middle"
	}, j) : n === "insideRight" ? bi({
		x: h + g - C,
		y: l + u / 2,
		horizontalAnchor: w,
		verticalAnchor: "middle"
	}, j) : n === "insideTop" ? bi({
		x: p + d / 2,
		y: l + y,
		horizontalAnchor: "middle",
		verticalAnchor: x
	}, j) : n === "insideBottom" ? bi({
		x: m + f / 2,
		y: l + u - y,
		horizontalAnchor: "middle",
		verticalAnchor: b
	}, j) : n === "insideTopLeft" ? bi({
		x: p + C,
		y: l + y,
		horizontalAnchor: T,
		verticalAnchor: x
	}, j) : n === "insideTopRight" ? bi({
		x: p + d - C,
		y: l + y,
		horizontalAnchor: w,
		verticalAnchor: x
	}, j) : n === "insideBottomLeft" ? bi({
		x: m + C,
		y: l + u - y,
		horizontalAnchor: T,
		verticalAnchor: b
	}, j) : n === "insideBottomRight" ? bi({
		x: m + f - C,
		y: l + u - y,
		horizontalAnchor: w,
		verticalAnchor: b
	}, j) : n && typeof n == "object" && (B(n.x) || oi(n.x)) && (B(n.y) || oi(n.y)) ? bi({
		x: c + ui(n.x, g),
		y: l + ui(n.y, u),
		horizontalAnchor: "end",
		verticalAnchor: "end"
	}, j) : bi({
		x: _,
		y: l + u / 2,
		horizontalAnchor: "middle",
		verticalAnchor: "middle"
	}, j);
}, Ti = [
	"top",
	"left",
	"right",
	"bottom"
];
function Ei(e) {
	return e == null ? !1 : typeof e == "object" || Ti.includes(e);
}
//#endregion
//#region node_modules/recharts/es6/context/legendPortalContext.js
var Di = /*#__PURE__*/ (0, y.createContext)(null);
//#endregion
//#region node_modules/d3-shape/src/constant.js
function Oi(e) {
	return function() {
		return e;
	};
}
//#endregion
//#region node_modules/d3-path/src/path.js
var ki = Math.PI, Ai = 2 * ki, ji = 1e-6, Mi = Ai - ji;
function Ni(e) {
	this._ += e[0];
	for (let t = 1, n = e.length; t < n; ++t) this._ += arguments[t] + e[t];
}
function Pi(e) {
	let t = Math.floor(e);
	if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
	if (t > 15) return Ni;
	let n = 10 ** t;
	return function(e) {
		this._ += e[0];
		for (let t = 1, r = e.length; t < r; ++t) this._ += Math.round(arguments[t] * n) / n + e[t];
	};
}
var Fi = class {
	constructor(e) {
		this._x0 = this._y0 = this._x1 = this._y1 = null, this._ = "", this._append = e == null ? Ni : Pi(e);
	}
	moveTo(e, t) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}`;
	}
	closePath() {
		this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
	}
	lineTo(e, t) {
		this._append`L${this._x1 = +e},${this._y1 = +t}`;
	}
	quadraticCurveTo(e, t, n, r) {
		this._append`Q${+e},${+t},${this._x1 = +n},${this._y1 = +r}`;
	}
	bezierCurveTo(e, t, n, r, i, a) {
		this._append`C${+e},${+t},${+n},${+r},${this._x1 = +i},${this._y1 = +a}`;
	}
	arcTo(e, t, n, r, i) {
		if (e = +e, t = +t, n = +n, r = +r, i = +i, i < 0) throw Error(`negative radius: ${i}`);
		let a = this._x1, o = this._y1, s = n - e, c = r - t, l = a - e, u = o - t, d = l * l + u * u;
		if (this._x1 === null) this._append`M${this._x1 = e},${this._y1 = t}`;
		else if (d > ji) {
			if (!(Math.abs(u * s - c * l) > ji) || !i) this._append`L${this._x1 = e},${this._y1 = t}`;
			else {
				let f = n - a, p = r - o, m = s * s + c * c, h = f * f + p * p, g = Math.sqrt(m), _ = Math.sqrt(d), v = i * Math.tan((ki - Math.acos((m + d - h) / (2 * g * _))) / 2), y = v / _, b = v / g;
				Math.abs(y - 1) > ji && this._append`L${e + y * l},${t + y * u}`, this._append`A${i},${i},0,0,${+(u * f > l * p)},${this._x1 = e + b * s},${this._y1 = t + b * c}`;
			}
		}
	}
	arc(e, t, n, r, i, a) {
		if (e = +e, t = +t, n = +n, a = !!a, n < 0) throw Error(`negative radius: ${n}`);
		let o = n * Math.cos(r), s = n * Math.sin(r), c = e + o, l = t + s, u = 1 ^ a, d = a ? r - i : i - r;
		this._x1 === null ? this._append`M${c},${l}` : (Math.abs(this._x1 - c) > ji || Math.abs(this._y1 - l) > ji) && this._append`L${c},${l}`, n && (d < 0 && (d = d % Ai + Ai), d > Mi ? this._append`A${n},${n},0,1,${u},${e - o},${t - s}A${n},${n},0,1,${u},${this._x1 = c},${this._y1 = l}` : d > ji && this._append`A${n},${n},0,${+(d >= ki)},${u},${this._x1 = e + n * Math.cos(i)},${this._y1 = t + n * Math.sin(i)}`);
	}
	rect(e, t, n, r) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}h${n = +n}v${+r}h${-n}Z`;
	}
	toString() {
		return this._;
	}
};
Fi.prototype;
//#endregion
//#region node_modules/d3-shape/src/path.js
function Ii(e) {
	let t = 3;
	return e.digits = function(n) {
		if (!arguments.length) return t;
		if (n == null) t = null;
		else {
			let e = Math.floor(n);
			if (!(e >= 0)) throw RangeError(`invalid digits: ${n}`);
			t = e;
		}
		return e;
	}, () => new Fi(t);
}
Array.prototype.slice;
function Li(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/linear.js
function Ri(e) {
	this._context = e;
}
Ri.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._context.lineTo(e, t);
		}
	}
};
function zi(e) {
	return new Ri(e);
}
//#endregion
//#region node_modules/d3-shape/src/point.js
function Bi(e) {
	return e[0];
}
function Vi(e) {
	return e[1];
}
//#endregion
//#region node_modules/d3-shape/src/line.js
function Hi(e, t) {
	var n = Oi(!0), r = null, i = zi, a = null, o = Ii(s);
	e = typeof e == "function" ? e : e === void 0 ? Bi : Oi(e), t = typeof t == "function" ? t : t === void 0 ? Vi : Oi(t);
	function s(s) {
		var c, l = (s = Li(s)).length, u, d = !1, f;
		for (r ?? (a = i(f = o())), c = 0; c <= l; ++c) !(c < l && n(u = s[c], c, s)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()), d && a.point(+e(u, c, s), +t(u, c, s));
		if (f) return a = null, f + "" || null;
	}
	return s.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Oi(+t), s) : e;
	}, s.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Oi(+e), s) : t;
	}, s.defined = function(e) {
		return arguments.length ? (n = typeof e == "function" ? e : Oi(!!e), s) : n;
	}, s.curve = function(e) {
		return arguments.length ? (i = e, r != null && (a = i(r)), s) : i;
	}, s.context = function(e) {
		return arguments.length ? (e == null ? r = a = null : a = i(r = e), s) : r;
	}, s;
}
//#endregion
//#region node_modules/d3-shape/src/area.js
function Ui(e, t, n) {
	var r = null, i = Oi(!0), a = null, o = zi, s = null, c = Ii(l);
	e = typeof e == "function" ? e : e === void 0 ? Bi : Oi(+e), t = typeof t == "function" ? t : Oi(t === void 0 ? 0 : +t), n = typeof n == "function" ? n : n === void 0 ? Vi : Oi(+n);
	function l(l) {
		var u, d, f, p = (l = Li(l)).length, m, h = !1, g, _ = Array(p), v = Array(p);
		for (a ?? (s = o(g = c())), u = 0; u <= p; ++u) {
			if (!(u < p && i(m = l[u], u, l)) === h) {
				if (h = !h) d = u, s.areaStart(), s.lineStart();
				else {
					for (s.lineEnd(), s.lineStart(), f = u - 1; f >= d; --f) s.point(_[f], v[f]);
					s.lineEnd(), s.areaEnd();
				}
			}
			h && (_[u] = +e(m, u, l), v[u] = +t(m, u, l), s.point(r ? +r(m, u, l) : _[u], n ? +n(m, u, l) : v[u]));
		}
		if (g) return s = null, g + "" || null;
	}
	function u() {
		return Hi().defined(i).curve(o).context(a);
	}
	return l.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Oi(+t), r = null, l) : e;
	}, l.x0 = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Oi(+t), l) : e;
	}, l.x1 = function(e) {
		return arguments.length ? (r = e == null ? null : typeof e == "function" ? e : Oi(+e), l) : r;
	}, l.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Oi(+e), n = null, l) : t;
	}, l.y0 = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : Oi(+e), l) : t;
	}, l.y1 = function(e) {
		return arguments.length ? (n = e == null ? null : typeof e == "function" ? e : Oi(+e), l) : n;
	}, l.lineX0 = l.lineY0 = function() {
		return u().x(e).y(t);
	}, l.lineY1 = function() {
		return u().x(e).y(n);
	}, l.lineX1 = function() {
		return u().x(r).y(t);
	}, l.defined = function(e) {
		return arguments.length ? (i = typeof e == "function" ? e : Oi(!!e), l) : i;
	}, l.curve = function(e) {
		return arguments.length ? (o = e, a != null && (s = o(a)), l) : o;
	}, l.context = function(e) {
		return arguments.length ? (e == null ? a = s = null : s = o(a = e), l) : a;
	}, l;
}
//#endregion
//#region node_modules/d3-shape/src/curve/bump.js
var Wi = class {
	constructor(e, t) {
		this._context = e, this._x = t;
	}
	areaStart() {
		this._line = 0;
	}
	areaEnd() {
		this._line = NaN;
	}
	lineStart() {
		this._point = 0;
	}
	lineEnd() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	}
	point(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._x ? this._context.bezierCurveTo(this._x0 = (this._x0 + e) / 2, this._y0, this._x0, t, e, t) : this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + t) / 2, e, this._y0, e, t);
		}
		this._x0 = e, this._y0 = t;
	}
};
function Gi(e) {
	return new Wi(e, !0);
}
function Ki(e) {
	return new Wi(e, !1);
}
//#endregion
//#region node_modules/d3-shape/src/noop.js
function qi() {}
//#endregion
//#region node_modules/d3-shape/src/curve/basis.js
function Ji(e, t, n) {
	e._context.bezierCurveTo((2 * e._x0 + e._x1) / 3, (2 * e._y0 + e._y1) / 3, (e._x0 + 2 * e._x1) / 3, (e._y0 + 2 * e._y1) / 3, (e._x0 + 4 * e._x1 + t) / 6, (e._y0 + 4 * e._y1 + n) / 6);
}
function Yi(e) {
	this._context = e;
}
Yi.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 3: Ji(this, this._x1, this._y1);
			case 2: this._context.lineTo(this._x1, this._y1);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
			default: Ji(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Xi(e) {
	return new Yi(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/basisClosed.js
function Zi(e) {
	this._context = e;
}
Zi.prototype = {
	areaStart: qi,
	areaEnd: qi,
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 1:
				this._context.moveTo(this._x2, this._y2), this._context.closePath();
				break;
			case 2:
				this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3), this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3), this._context.closePath();
				break;
			case 3: this.point(this._x2, this._y2), this.point(this._x3, this._y3), this.point(this._x4, this._y4);
		}
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._x2 = e, this._y2 = t;
				break;
			case 1:
				this._point = 2, this._x3 = e, this._y3 = t;
				break;
			case 2:
				this._point = 3, this._x4 = e, this._y4 = t, this._context.moveTo((this._x0 + 4 * this._x1 + e) / 6, (this._y0 + 4 * this._y1 + t) / 6);
				break;
			default: Ji(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Qi(e) {
	return new Zi(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/basisOpen.js
function $i(e) {
	this._context = e;
}
$i.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1;
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3;
				var n = (this._x0 + 4 * this._x1 + e) / 6, r = (this._y0 + 4 * this._y1 + t) / 6;
				this._line ? this._context.lineTo(n, r) : this._context.moveTo(n, r);
				break;
			case 3: this._point = 4;
			default: Ji(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function ea(e) {
	return new $i(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/linearClosed.js
function ta(e) {
	this._context = e;
}
ta.prototype = {
	areaStart: qi,
	areaEnd: qi,
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		this._point && this._context.closePath();
	},
	point: function(e, t) {
		e = +e, t = +t, this._point ? this._context.lineTo(e, t) : (this._point = 1, this._context.moveTo(e, t));
	}
};
function na(e) {
	return new ta(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/monotone.js
function ra(e) {
	return e < 0 ? -1 : 1;
}
function V(e, t, n) {
	var r = e._x1 - e._x0, i = t - e._x1, a = (e._y1 - e._y0) / (r || i < 0 && -0), o = (n - e._y1) / (i || r < 0 && -0), s = (a * i + o * r) / (r + i);
	return (ra(a) + ra(o)) * Math.min(Math.abs(a), Math.abs(o), .5 * Math.abs(s)) || 0;
}
function ia(e, t) {
	var n = e._x1 - e._x0;
	return n ? (3 * (e._y1 - e._y0) / n - t) / 2 : t;
}
function aa(e, t, n) {
	var r = e._x0, i = e._y0, a = e._x1, o = e._y1, s = (a - r) / 3;
	e._context.bezierCurveTo(r + s, i + s * t, a - s, o - s * n, a, o);
}
function oa(e) {
	this._context = e;
}
oa.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3: aa(this, this._t0, ia(this, this._t0));
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		var n = NaN;
		if (e = +e, t = +t, e !== this._x1 || t !== this._y1) {
			switch (this._point) {
				case 0:
					this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
					break;
				case 1:
					this._point = 2;
					break;
				case 2:
					this._point = 3, aa(this, ia(this, n = V(this, e, t)), n);
					break;
				default: aa(this, this._t0, n = V(this, e, t));
			}
			this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = n;
		}
	}
};
function sa(e) {
	this._context = new ca(e);
}
(sa.prototype = Object.create(oa.prototype)).point = function(e, t) {
	oa.prototype.point.call(this, t, e);
};
function ca(e) {
	this._context = e;
}
ca.prototype = {
	moveTo: function(e, t) {
		this._context.moveTo(t, e);
	},
	closePath: function() {
		this._context.closePath();
	},
	lineTo: function(e, t) {
		this._context.lineTo(t, e);
	},
	bezierCurveTo: function(e, t, n, r, i, a) {
		this._context.bezierCurveTo(t, e, r, n, a, i);
	}
};
function la(e) {
	return new oa(e);
}
function ua(e) {
	return new sa(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/natural.js
function da(e) {
	this._context = e;
}
da.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = [], this._y = [];
	},
	lineEnd: function() {
		var e = this._x, t = this._y, n = e.length;
		if (n) {
			if (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), n === 2) this._context.lineTo(e[1], t[1]);
			else for (var r = fa(e), i = fa(t), a = 0, o = 1; o < n; ++a, ++o) this._context.bezierCurveTo(r[0][a], i[0][a], r[1][a], i[1][a], e[o], t[o]);
		}
		(this._line || this._line !== 0 && n === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
	},
	point: function(e, t) {
		this._x.push(+e), this._y.push(+t);
	}
};
function fa(e) {
	var t, n = e.length - 1, r, i = Array(n), a = Array(n), o = Array(n);
	for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < n - 1; ++t) i[t] = 1, a[t] = 4, o[t] = 4 * e[t] + 2 * e[t + 1];
	for (i[n - 1] = 2, a[n - 1] = 7, o[n - 1] = 8 * e[n - 1] + e[n], t = 1; t < n; ++t) r = i[t] / a[t - 1], a[t] -= r, o[t] -= r * o[t - 1];
	for (i[n - 1] = o[n - 1] / a[n - 1], t = n - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
	for (a[n - 1] = (e[n] + i[n - 1]) / 2, t = 0; t < n - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
	return [i, a];
}
function pa(e) {
	return new da(e);
}
//#endregion
//#region node_modules/d3-shape/src/curve/step.js
function ma(e, t) {
	this._context = e, this._t = t;
}
ma.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = this._y = NaN, this._point = 0;
	},
	lineEnd: function() {
		0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y), (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line >= 0 && (this._t = 1 - this._t, this._line = 1 - this._line);
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: if (this._t <= 0) this._context.lineTo(this._x, t), this._context.lineTo(e, t);
			else {
				var n = this._x * (1 - this._t) + e * this._t;
				this._context.lineTo(n, this._y), this._context.lineTo(n, t);
			}
		}
		this._x = e, this._y = t;
	}
};
function ha(e) {
	return new ma(e, .5);
}
function ga(e) {
	return new ma(e, 0);
}
function _a(e) {
	return new ma(e, 1);
}
//#endregion
//#region node_modules/d3-shape/src/offset/none.js
function va(e, t) {
	if ((o = e.length) > 1) for (var n = 1, r, i, a = e[t[0]], o, s = a.length; n < o; ++n) for (i = a, a = e[t[n]], r = 0; r < s; ++r) a[r][1] += a[r][0] = isNaN(i[r][1]) ? i[r][0] : i[r][1];
}
//#endregion
//#region node_modules/d3-shape/src/order/none.js
function ya(e) {
	for (var t = e.length, n = Array(t); --t >= 0;) n[t] = t;
	return n;
}
//#endregion
//#region node_modules/d3-shape/src/stack.js
function ba(e, t) {
	return e[t];
}
function xa(e) {
	let t = [];
	return t.key = e, t;
}
function Sa() {
	var e = Oi([]), t = ya, n = va, r = ba;
	function i(i) {
		var a = Array.from(e.apply(this, arguments), xa), o, s = a.length, c = -1, l;
		for (let e of i) for (o = 0, ++c; o < s; ++o) (a[o][c] = [0, +r(e, a[o].key, c, i)]).data = e;
		for (o = 0, l = Li(t(a)); o < s; ++o) a[l[o]].index = o;
		return n(a, l), a;
	}
	return i.keys = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : Oi(Array.from(t)), i) : e;
	}, i.value = function(e) {
		return arguments.length ? (r = typeof e == "function" ? e : Oi(+e), i) : r;
	}, i.order = function(e) {
		return arguments.length ? (t = e == null ? ya : typeof e == "function" ? e : Oi(Array.from(e)), i) : t;
	}, i.offset = function(e) {
		return arguments.length ? (n = e ?? va, i) : n;
	}, i;
}
//#endregion
//#region node_modules/d3-shape/src/offset/expand.js
function Ca(e, t) {
	if ((r = e.length) > 0) {
		for (var n, r, i = 0, a = e[0].length, o; i < a; ++i) {
			for (o = n = 0; n < r; ++n) o += e[n][i][1] || 0;
			if (o) for (n = 0; n < r; ++n) e[n][i][1] /= o;
		}
		va(e, t);
	}
}
//#endregion
//#region node_modules/d3-shape/src/offset/silhouette.js
function wa(e, t) {
	if ((i = e.length) > 0) {
		for (var n = 0, r = e[t[0]], i, a = r.length; n < a; ++n) {
			for (var o = 0, s = 0; o < i; ++o) s += e[o][n][1] || 0;
			r[n][1] += r[n][0] = -s / 2;
		}
		va(e, t);
	}
}
//#endregion
//#region node_modules/d3-shape/src/offset/wiggle.js
function Ta(e, t) {
	if ((o = e.length) > 0 && (a = (i = e[t[0]]).length) > 0) {
		for (var n = 0, r = 1, i, a, o; r < a; ++r) {
			for (var s = 0, c = 0, l = 0; s < o; ++s) {
				for (var u = e[t[s]], d = u[r][1] || 0, f = (d - (u[r - 1][1] || 0)) / 2, p = 0; p < s; ++p) {
					var m = e[t[p]], h = m[r][1] || 0, g = m[r - 1][1] || 0;
					f += h - g;
				}
				c += d, l += f * d;
			}
			i[r - 1][1] += i[r - 1][0] = n, c && (n -= l / c);
		}
		i[r - 1][1] += i[r - 1][0] = n, va(e, t);
	}
}
//#endregion
//#region node_modules/recharts/es6/util/types.js
var Ea = (e) => "radius" in e && "startAngle" in e && "endAngle" in e, Da = (e, t) => {
	if (!e || typeof e == "function" || typeof e == "boolean") return null;
	var n = e;
	if (/*#__PURE__*/ (0, y.isValidElement)(e) && (n = e.props), typeof n != "object" && typeof n != "function") return null;
	var r = {};
	return Object.keys(n).forEach((e) => {
		Dr(e) && typeof n[e] == "function" && (r[e] = t || ((t) => n[e](n, t)));
	}), r;
}, Oa = (e, t, n) => (r) => (e(t, n, r), null), ka = (e, t, n) => {
	if (e === null || typeof e != "object" && typeof e != "function") return null;
	var r = null;
	return Object.keys(e).forEach((i) => {
		var a = e[i];
		Dr(i) && typeof a == "function" && (r ||= {}, r[i] = Oa(a, t, n));
	}), r;
};
//#endregion
//#region node_modules/recharts/es6/util/resolveDefaultProps.js
function Aa(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ja(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Aa(Object(n), !0).forEach(function(t) {
			Ma(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Aa(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ma(e, t, n) {
	return (t = Na(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Na(e) {
	var t = Pa(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Pa(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Fa(e, t) {
	var n = ja({}, e), r = t;
	return Object.keys(t).reduce((e, t) => (e[t] === void 0 && r[t] !== void 0 && (e[t] = r[t]), e), n);
}
//#endregion
//#region node_modules/es-toolkit/dist/array/uniqBy.mjs
function Ia(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t(i, r, e);
		n.has(a) || n.set(a, i);
	}
	return Array.from(n.values());
}
//#endregion
//#region node_modules/es-toolkit/dist/function/ary.mjs
function La(e, t) {
	return function(...n) {
		return e.apply(this, n.slice(0, t));
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/function/identity.mjs
function Ra(e) {
	return e;
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isLength.mjs
function za(e) {
	return Number.isSafeInteger(e) && e >= 0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function Ba(e) {
	return e != null && typeof e != "function" && za(e.length);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/property.mjs
function Va(e) {
	return function(t) {
		return $r(t, e);
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function Ha(e) {
	return e == null || typeof e != "object" && typeof e != "function";
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function Ua(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function Wa(e) {
	return Object.getOwnPropertySymbols(e).filter((t) => Object.prototype.propertyIsEnumerable.call(e, t));
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function Ga(e) {
	return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var Ka = "[object RegExp]", qa = "[object String]", Ja = "[object Number]", Ya = "[object Boolean]", Xa = "[object Arguments]", Za = "[object Symbol]", Qa = "[object Date]", $a = "[object Map]", eo = "[object Set]", to = "[object Array]", no = "[object Function]", ro = "[object ArrayBuffer]", io = "[object Object]", ao = "[object Error]", oo = "[object DataView]", so = "[object Uint8Array]", co = "[object Uint8ClampedArray]", lo = "[object Uint16Array]", uo = "[object Uint32Array]", fo = "[object BigUint64Array]", po = "[object Int8Array]", mo = "[object Int16Array]", ho = "[object Int32Array]", go = "[object BigInt64Array]", _o = "[object Float32Array]", vo = "[object Float64Array]", yo = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof global == "object" && global || (function() {
	return this;
})();
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function bo(e) {
	return yo.Buffer !== void 0 && yo.Buffer.isBuffer(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function xo(e, t) {
	return So(e, void 0, e, /* @__PURE__ */ new Map(), t);
}
function So(e, t, n, r = /* @__PURE__ */ new Map(), i = void 0) {
	let a = i?.(e, t, n, r);
	if (a !== void 0) return a;
	if (Ha(e)) return e;
	if (r.has(e)) return r.get(e);
	if (Array.isArray(e)) {
		let t = Array(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = So(e[a], a, n, r, i);
		return Object.hasOwn(e, "index") && (t.index = e.index), Object.hasOwn(e, "input") && (t.input = e.input), t;
	}
	if (e instanceof Date) return new Date(e.getTime());
	if (e instanceof RegExp) {
		let t = new RegExp(e.source, e.flags);
		return t.lastIndex = e.lastIndex, t;
	}
	if (e instanceof Map) {
		let t = /* @__PURE__ */ new Map();
		r.set(e, t);
		for (let [a, o] of e) t.set(a, So(o, a, n, r, i));
		return t;
	}
	if (e instanceof Set) {
		let t = /* @__PURE__ */ new Set();
		r.set(e, t);
		for (let a of e) t.add(So(a, void 0, n, r, i));
		return t;
	}
	if (bo(e)) return e.subarray();
	if (Ua(e)) {
		let t = new (Object.getPrototypeOf(e)).constructor(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = So(e[a], a, n, r, i);
		return t;
	}
	if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
	if (e instanceof DataView) {
		let t = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (typeof File < "u" && e instanceof File) {
		let t = new File([e], e.name, { type: e.type });
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (typeof Blob < "u" && e instanceof Blob) {
		let t = new Blob([e], { type: e.type });
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (e instanceof Error) {
		let t = structuredClone(e);
		return r.set(e, t), t.message = e.message, t.name = e.name, t.stack = e.stack, t.cause = e.cause, t.constructor = e.constructor, Co(t, e, n, r, i), t;
	}
	if (e instanceof Boolean) {
		let t = new Boolean(e.valueOf());
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (e instanceof Number) {
		let t = new Number(e.valueOf());
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (e instanceof String) {
		let t = new String(e.valueOf());
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	if (typeof e == "object" && wo(e)) {
		let t = Object.create(Object.getPrototypeOf(e));
		return r.set(e, t), Co(t, e, n, r, i), t;
	}
	return e;
}
function Co(e, t, n = e, r, i) {
	let a = [...Object.keys(t), ...Wa(t)];
	for (let o = 0; o < a.length; o++) {
		let s = a[o], c = Object.getOwnPropertyDescriptor(e, s);
		(c == null || c.writable) && (e[s] = So(t[s], s, n, r, i));
	}
}
function wo(e) {
	switch (Ga(e)) {
		case Xa:
		case to:
		case ro:
		case oo:
		case Ya:
		case Qa:
		case _o:
		case vo:
		case po:
		case mo:
		case ho:
		case $a:
		case Ja:
		case io:
		case Ka:
		case eo:
		case qa:
		case Za:
		case so:
		case co:
		case lo:
		case uo: return !0;
		default: return !1;
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/object/cloneDeep.mjs
function To(e) {
	return So(e, void 0, e, /* @__PURE__ */ new Map(), void 0);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/eq.mjs
function Eo(e, t) {
	return e === t || Number.isNaN(e) && Number.isNaN(t);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function Do(e) {
	return e !== null && (typeof e == "object" || typeof e == "function");
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isMatchWith.mjs
function Oo(e, t, n) {
	return typeof n == "function" ? ko(e, t, function e(t, r, i, a, o, s) {
		let c = n(t, r, i, a, o, s);
		return c === void 0 ? ko(t, r, e, s, !1) : !!c;
	}, /* @__PURE__ */ new Map(), !0) : Oo(e, t, () => void 0);
}
function ko(e, t, n, r, i = !1) {
	if (t === e) return !0;
	switch (typeof t) {
		case "object": return Ao(e, t, n, r, i);
		case "function": return Object.keys(t).length > 0 ? ko(e, { ...t }, n, r, i) : Eo(e, t);
		default: return Do(e) && i ? typeof t != "string" || t === "" : Eo(e, t);
	}
}
function Ao(e, t, n, r, i = !1) {
	if (t == null) return !0;
	if (Array.isArray(t)) return Mo(e, t, n, r);
	if (t instanceof Map) return jo(e, t, n, r);
	if (t instanceof Set) return No(e, t, n, r);
	let a = Object.keys(t);
	if (e == null) return i && a.length === 0;
	if (i) Ha(e) && (e = Object(e));
	else {
		let t = Ga(e);
		if (t !== "[object Object]" && t !== "[object Arguments]") return !1;
	}
	if (a.length === 0) return !0;
	if (r?.has(t)) return r.get(t) === e;
	r?.set(t, e);
	try {
		for (let i = 0; i < a.length; i++) {
			let o = a[i];
			if (!(o in e) || t[o] === void 0 && e[o] !== void 0 || t[o] === null && e[o] !== null || !n(e[o], t[o], o, e, t, r)) return !1;
		}
		return !0;
	} finally {
		r?.delete(t);
	}
}
function jo(e, t, n, r) {
	if (t.size === 0) return !0;
	if (!(e instanceof Map)) return !1;
	for (let [i, a] of t.entries()) if (n(e.get(i), a, i, e, t, r) === !1) return !1;
	return !0;
}
function Mo(e, t, n, r) {
	if (t.length === 0) return !0;
	if (!Array.isArray(e)) return !1;
	let i = /* @__PURE__ */ new Set();
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = !1;
		for (let c = 0; c < e.length; c++) {
			if (i.has(c)) continue;
			let l = e[c], u = !1;
			if (n(l, o, a, e, t, r) && (u = !0), u) {
				i.add(c), s = !0;
				break;
			}
		}
		if (!s) return !1;
	}
	return !0;
}
function No(e, t, n, r) {
	return t.size === 0 || e instanceof Set && Mo([...e], [...t], n, r);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isMatch.mjs
function Po(e, t) {
	return Oo(e, t, () => void 0);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/matches.mjs
function Fo(e) {
	return e = To(e), (t) => Po(t, e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function Io(e, t) {
	return xo(e, (n, r, i, a) => {
		let o = t?.(n, r, i, a);
		if (o !== void 0) return o;
		if (typeof e == "object") {
			if (Ga(e) === "[object Object]" && typeof e.constructor != "function") {
				let t = {};
				return a.set(e, t), Co(t, e, i, a), t;
			}
			switch (Object.prototype.toString.call(e)) {
				case Ja:
				case qa:
				case Ya: {
					let t = new e.constructor(e?.valueOf());
					return Co(t, e), t;
				}
				case Xa: {
					let t = {};
					return Co(t, e), t.length = e.length, t[Symbol.iterator] = e[Symbol.iterator], t;
				}
				default: return;
			}
		}
	});
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function Lo(e) {
	return Io(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
var Ro = /^(?:0|[1-9]\d*)$/;
function zo(e, t = 2 ** 53 - 1) {
	switch (typeof e) {
		case "number": return Number.isInteger(e) && e >= 0 && e < t;
		case "symbol": return !1;
		case "string": return Ro.test(e);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function Bo(e) {
	return typeof e == "object" && !!e && Ga(e) === "[object Arguments]";
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/object/has.mjs
function Vo(e, t) {
	let n;
	if (n = Array.isArray(t) ? t : typeof t == "string" && qr(t) && !(t in Object(e)) ? Qr(t) : [t], n.length === 0) return !1;
	let r = e;
	for (let e = 0; e < n.length; e++) {
		let t = Jr(n[e]);
		if ((r == null || !Object.hasOwn(r, t)) && !((Array.isArray(r) || Bo(r)) && zo(t) && Number(t) < r.length)) return !1;
		r = r[t];
	}
	return !0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/predicate/matchesProperty.mjs
function H(e, t) {
	switch (typeof e) {
		case "object":
			Object.is(e?.valueOf(), -0) && (e = "-0");
			break;
		case "number": e = Jr(e);
	}
	return t = Lo(t), function(n) {
		let r = $r(n, e);
		return r === void 0 ? Vo(n, e) : t === void 0 ? r === void 0 : Po(r, t);
	};
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/iteratee.mjs
function Ho(e) {
	if (e == null) return Ra;
	switch (typeof e) {
		case "function": return e;
		case "object": return Array.isArray(e) && e.length === 2 ? H(e[0], e[1]) : Fo(e);
		default: return Va(e);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/normalizeZero.mjs
function Uo(e) {
	return e === 0 ? 0 : e;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/uniqBy.mjs
function Wo(e, t = Ra) {
	return Ba(e) ? Ia(Array.from(e), La(Ho(t), 1)).map(Uo) : [];
}
//#endregion
//#region node_modules/recharts/es6/util/payload/getUniqPayload.js
function Go(e, t, n) {
	return t === !0 ? Wo(e, n) : typeof t == "function" ? Wo(e, t) : e;
}
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var Ko = /* @__PURE__ */ s(((e) => {
	var t = m();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), qo = /* @__PURE__ */ s(((e, t) => {
	t.exports = Ko();
})), Jo = /* @__PURE__ */ s(((e) => {
	var t = m(), n = qo();
	function r(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var i = typeof Object.is == "function" ? Object.is : r, a = n.useSyncExternalStore, o = t.useRef, s = t.useEffect, c = t.useMemo, l = t.useDebugValue;
	e.useSyncExternalStoreWithSelector = function(e, t, n, r, u) {
		var d = o(null);
		if (d.current === null) {
			var f = {
				hasValue: !1,
				value: null
			};
			d.current = f;
		} else f = d.current;
		d = c(function() {
			function e(e) {
				if (!a) {
					if (a = !0, o = e, e = r(e), u !== void 0 && f.hasValue) {
						var t = f.value;
						if (u(t, e)) return s = t;
					}
					return s = e;
				}
				if (t = s, i(o, e)) return t;
				var n = r(e);
				return u !== void 0 && u(t, n) ? (o = e, t) : (o = e, s = n);
			}
			var a = !1, o, s, c = n === void 0 ? null : n;
			return [function() {
				return e(t());
			}, c === null ? void 0 : function() {
				return e(c());
			}];
		}, [
			t,
			n,
			r,
			u
		]);
		var p = a(e, d[0], d[1]);
		return s(function() {
			f.hasValue = !0, f.value = p;
		}, [p]), l(p), p;
	};
})), Yo = /* @__PURE__ */ s(((e, t) => {
	t.exports = Jo();
})), Xo = /*#__PURE__*/ (0, y.createContext)(null), Zo = Yo(), Qo = (e) => e, $o = () => {
	var e = (0, y.useContext)(Xo);
	return e ? e.store.dispatch : Qo;
}, es = () => {}, ts = () => es, ns = (e, t) => e === t;
function U(e) {
	var t = (0, y.useContext)(Xo), n = (0, y.useMemo)(() => t ? (t) => {
		if (t != null) return e(t);
	} : es, [t, e]);
	return (0, Zo.useSyncExternalStoreWithSelector)(t ? t.subscription.addNestedSub : ts, t ? t.store.getState : es, t ? t.store.getState : es, n, ns);
}
//#endregion
//#region node_modules/reselect/dist/reselect.mjs
function rs(e, t = `expected a function, instead received ${typeof e}`) {
	if (typeof e != "function") throw TypeError(t);
}
function is(e, t = "expected all items to be functions, instead received the following types: ") {
	if (!e.every((e) => typeof e == "function")) {
		let n = e.map((e) => typeof e == "function" ? `function ${e.name || "unnamed"}()` : typeof e).join(", ");
		throw TypeError(`${t}[${n}]`);
	}
}
var as = (e) => Array.isArray(e) ? e : [e];
function os(e) {
	let t = Array.isArray(e[0]) ? e[0] : e;
	return is(t, "createSelector expects all input-selectors to be functions, but received the following types: "), t;
}
function ss(e, t) {
	let n = [], { length: r } = e;
	for (let i = 0; i < r; i++) n.push(e[i].apply(null, t));
	return n;
}
var cs = class {
	constructor(e) {
		this.value = e;
	}
	deref() {
		return this.value;
	}
}, ls = typeof WeakRef > "u" ? cs : WeakRef, us = 0, ds = 1;
function fs() {
	return {
		s: us,
		v: void 0,
		o: null,
		p: null
	};
}
function ps(e) {
	return e instanceof ls ? e.deref() : e;
}
function ms(e, t = {}) {
	let n = fs(), { resultEqualityCheck: r } = t, i, a = 0;
	function o() {
		let t = n, { length: o } = arguments;
		for (let e = 0, n = o; e < n; e++) {
			let n = arguments[e];
			if (typeof n == "function" || typeof n == "object" && n) {
				let e = t.o;
				e === null && (t.o = e = /* @__PURE__ */ new WeakMap());
				let r = e.get(n);
				r === void 0 ? (t = fs(), e.set(n, t)) : t = r;
			} else {
				let e = t.p;
				e === null && (t.p = e = /* @__PURE__ */ new Map());
				let r = e.get(n);
				r === void 0 ? (t = fs(), e.set(n, t)) : t = r;
			}
		}
		let s = t, c;
		if (t.s === ds) c = t.v;
		else if (c = e.apply(null, arguments), a++, r) {
			let e = ps(i);
			e != null && r(e, c) && (c = e, a !== 0 && a--), i = typeof c == "object" && c || typeof c == "function" ? /* @__PURE__ */ new ls(c) : c;
		}
		return s.s = ds, s.v = c, c;
	}
	return o.clearCache = () => {
		n = fs(), o.resetResultsCount();
	}, o.resultsCount = () => a, o.resetResultsCount = () => {
		a = 0;
	}, o;
}
function hs(e, ...t) {
	let n = typeof e == "function" ? {
		memoize: e,
		memoizeOptions: t
	} : e, r = (...e) => {
		let t = 0, r = 0, i, a = {}, o = e.pop();
		typeof o == "object" && (a = o, o = e.pop()), rs(o, `createSelector expects an output function after the inputs, but received: [${typeof o}]`);
		let { memoize: s, memoizeOptions: c = [], argsMemoize: l = ms, argsMemoizeOptions: u = [] } = {
			...n,
			...a
		}, d = as(c), f = as(u), p = os(e), m = s(function() {
			return t++, o.apply(null, arguments);
		}, ...d), h = l(function() {
			r++;
			let e = ss(p, arguments);
			return i = m.apply(null, e), i;
		}, ...f);
		return Object.assign(h, {
			resultFunc: o,
			memoizedResultFunc: m,
			dependencies: p,
			dependencyRecomputations: () => r,
			resetDependencyRecomputations: () => {
				r = 0;
			},
			lastResult: () => i,
			recomputations: () => t,
			resetRecomputations: () => {
				t = 0;
			},
			memoize: s,
			argsMemoize: l
		});
	};
	return Object.assign(r, { withTypes: () => r }), r;
}
var W = /* @__PURE__ */ hs(ms);
//#endregion
//#region node_modules/es-toolkit/dist/array/flatten.mjs
function gs(e, t = 1) {
	let n = [], r = Math.floor(t), i = (e, t) => {
		for (let a = 0; a < e.length; a++) {
			let o = e[a];
			Array.isArray(o) && t < r ? i(o, t + 1) : n.push(o);
		}
	};
	return i(e, 0), n;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.mjs
function _s(e, t, n) {
	return Do(n) && (typeof t == "number" && Ba(n) && zo(t) && t < n.length || typeof t == "string" && t in n) ? Eo(n[t], e) : !1;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/_internal/compareValues.mjs
function vs(e) {
	return typeof e == "symbol" ? 1 : e === null ? 2 : e === void 0 ? 3 : e === e ? 0 : 4;
}
var ys = (e, t, n) => {
	if (e !== t) {
		let r = vs(e), i = vs(t);
		if (r === i && r === 0) {
			if (e < t) return n === "desc" ? 1 : -1;
			if (e > t) return n === "desc" ? -1 : 1;
		}
		return n === "desc" ? i - r : r - i;
	}
	return 0;
}, bs = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, xs = /^\w*$/;
function Ss(e, t) {
	return Array.isArray(e) ? !1 : typeof e == "number" || typeof e == "boolean" || e == null || Yr(e) ? !0 : typeof e == "string" && (xs.test(e) || !bs.test(e)) || t != null && Object.hasOwn(t, e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/orderBy.mjs
function Cs(e, t, n, r) {
	if (e == null) return [];
	n = r ? void 0 : n, Array.isArray(e) || (e = Ba(e) ? Array.from(e) : Object.values(e)), Array.isArray(t) || (t = t == null ? [null] : [t]), t.length === 0 && (t = [null]), Array.isArray(n) || (n = n == null ? [] : [n]), n = n.map((e) => String(e));
	let i = (e, t) => {
		let n = e, r = 0;
		for (; r < t.length && n != null; ++r) n = n[t[r]];
		return r > 0 && r === t.length ? n : void 0;
	}, a = (e, t) => {
		if (e == null) return t;
		if (t != null) return typeof e == "object" && "key" in e ? Object.hasOwn(t, e.key) ? t[e.key] : i(t, e.path) : typeof e == "function" ? e(t) : Array.isArray(e) ? i(t, e) : t[e];
	}, o = t.map((e) => (Array.isArray(e) && e.length === 1 && (e = e[0]), e == null || typeof e == "function" || Array.isArray(e) || Ss(e) ? e : {
		key: e,
		path: Qr(e)
	}));
	return e.map((e) => ({
		original: e,
		criteria: o.map((t) => a(t, e))
	})).slice().sort((e, t) => {
		for (let r = 0; r < o.length; r++) {
			let i = ys(e.criteria[r], t.criteria[r], n[r]);
			if (i !== 0) return i;
		}
		return 0;
	}).map((e) => e.original);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/array/sortBy.mjs
function ws(e, ...t) {
	let n = t.length;
	return n > 1 && _s(e, t[0], t[1]) ? t = [] : n > 2 && _s(t[0], t[1], t[2]) && (t = [t[0]]), Cs(e, gs(t), ["asc"]);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/legendSelectors.js
var Ts = (e) => e.legend.settings, Es = (e) => e.legend.size;
W([(e) => e.legend.payload, Ts], (e, t) => {
	var n = t.itemSorter, r = e.flat(1);
	return n ? ws(r, n) : r;
});
//#endregion
//#region node_modules/recharts/es6/util/useElementOffset.js
function Ds(e, t) {
	return Ms(e) || js(e, t) || ks(e, t) || Os();
}
function Os() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ks(e, t) {
	if (e) {
		if (typeof e == "string") return As(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? As(e, t) : void 0;
	}
}
function As(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function js(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Ms(e) {
	if (Array.isArray(e)) return e;
}
var Ns = 1;
function Ps(e, t) {
	return Math.abs(e.height - t.height) > Ns || Math.abs(e.left - t.left) > Ns || Math.abs(e.top - t.top) > Ns || Math.abs(e.width - t.width) > Ns;
}
function Fs(e) {
	var t = e.getBoundingClientRect();
	return {
		height: t.height,
		left: t.left,
		top: t.top,
		width: t.width
	};
}
function Is() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = Ds((0, y.useState)({
		height: 0,
		left: 0,
		top: 0,
		width: 0
	}), 2), n = t[0], r = t[1], i = (0, y.useRef)(null), a = (0, y.useRef)(n);
	a.current = n;
	var o = (0, y.useCallback)((e) => {
		if (i.current != null && (i.current.disconnect(), i.current = null), e != null) {
			var t = Fs(e);
			if (Ps(t, a.current) && r(t), typeof ResizeObserver < "u") {
				var n = new ResizeObserver(() => {
					var t = Fs(e);
					Ps(t, a.current) && r(t);
				});
				n.observe(e), i.current = n;
			}
		}
	}, [...e]);
	return (0, y.useEffect)(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), [n, o];
}
//#endregion
//#region node_modules/redux/dist/redux.mjs
function Ls(e) {
	return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var Rs = typeof Symbol == "function" && Symbol.observable || "@@observable", zs = () => Math.random().toString(36).substring(7).split("").join("."), Bs = {
	INIT: `@@redux/INIT${/* @__PURE__ */ zs()}`,
	REPLACE: `@@redux/REPLACE${/* @__PURE__ */ zs()}`,
	PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${zs()}`
};
function Vs(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	for (; Object.getPrototypeOf(t) !== null;) t = Object.getPrototypeOf(t);
	return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Hs(e, t, n) {
	if (typeof e != "function") throw Error(Ls(2));
	if (typeof t == "function" && typeof n == "function" || typeof n == "function" && typeof arguments[3] == "function") throw Error(Ls(0));
	if (typeof t == "function" && n === void 0 && (n = t, t = void 0), n !== void 0) {
		if (typeof n != "function") throw Error(Ls(1));
		return n(Hs)(e, t);
	}
	let r = e, i = t, a = /* @__PURE__ */ new Map(), o = a, s = 0, c = !1;
	function l() {
		o === a && (o = /* @__PURE__ */ new Map(), a.forEach((e, t) => {
			o.set(t, e);
		}));
	}
	function u() {
		if (c) throw Error(Ls(3));
		return i;
	}
	function d(e) {
		if (typeof e != "function") throw Error(Ls(4));
		if (c) throw Error(Ls(5));
		let t = !0;
		l();
		let n = s++;
		return o.set(n, e), function() {
			if (t) {
				if (c) throw Error(Ls(6));
				t = !1, l(), o.delete(n), a = null;
			}
		};
	}
	function f(e) {
		if (!Vs(e)) throw Error(Ls(7));
		if (e.type === void 0) throw Error(Ls(8));
		if (typeof e.type != "string") throw Error(Ls(17));
		if (c) throw Error(Ls(9));
		try {
			c = !0, i = r(i, e);
		} finally {
			c = !1;
		}
		return (a = o).forEach((e) => {
			e();
		}), e;
	}
	function p(e) {
		if (typeof e != "function") throw Error(Ls(10));
		r = e, f({ type: Bs.REPLACE });
	}
	function m() {
		let e = d;
		return {
			subscribe(t) {
				if (typeof t != "object" || !t) throw Error(Ls(11));
				function n() {
					let e = t;
					e.next && e.next(u());
				}
				return n(), { unsubscribe: e(n) };
			},
			[Rs]() {
				return this;
			}
		};
	}
	return f({ type: Bs.INIT }), {
		dispatch: f,
		subscribe: d,
		getState: u,
		replaceReducer: p,
		[Rs]: m
	};
}
function Us(e) {
	Object.keys(e).forEach((t) => {
		let n = e[t];
		if (n(void 0, { type: Bs.INIT }) === void 0) throw Error(Ls(12));
		if (n(void 0, { type: Bs.PROBE_UNKNOWN_ACTION() }) === void 0) throw Error(Ls(13));
	});
}
function Ws(e) {
	let t = Object.keys(e), n = {};
	for (let r = 0; r < t.length; r++) {
		let i = t[r];
		typeof e[i] == "function" && (n[i] = e[i]);
	}
	let r = Object.keys(n), i;
	try {
		Us(n);
	} catch (e) {
		i = e;
	}
	return function(e = {}, t) {
		if (i) throw i;
		let a = !1, o = {};
		for (let i = 0; i < r.length; i++) {
			let s = r[i], c = n[s], l = e[s], u = c(l, t);
			if (u === void 0) throw t && t.type, Error(Ls(14));
			o[s] = u, a ||= u !== l;
		}
		return a ||= r.length !== Object.keys(e).length, a ? o : e;
	};
}
function Gs(...e) {
	return e.length === 0 ? (e) => e : e.length === 1 ? e[0] : e.reduce((e, t) => (...n) => e(t(...n)));
}
function Ks(...e) {
	return (t) => (n, r) => {
		let i = t(n, r), a = () => {
			throw Error(Ls(15));
		}, o = {
			getState: i.getState,
			dispatch: (e, ...t) => a(e, ...t)
		};
		return a = Gs(...e.map((e) => e(o)))(i.dispatch), {
			...i,
			dispatch: a
		};
	};
}
function qs(e) {
	return Vs(e) && "type" in e && typeof e.type == "string";
}
//#endregion
//#region node_modules/immer/dist/immer.mjs
var Js = Symbol.for("immer-nothing"), Ys = Symbol.for("immer-draftable"), Xs = Symbol.for("immer-state");
function Zs(e, ...t) {
	throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var Qs = Object, $s = Qs.getPrototypeOf, ec = "constructor", tc = "prototype", nc = "configurable", rc = "enumerable", ic = "writable", ac = "value", oc = (e) => !!e && !!e[Xs];
function sc(e) {
	return e ? uc(e) || _c(e) || !!e[Ys] || !!e[ec]?.[Ys] || vc(e) || yc(e) : !1;
}
var cc = Qs[tc][ec].toString(), lc = /* @__PURE__ */ new WeakMap();
function uc(e) {
	if (!e || !bc(e)) return !1;
	let t = $s(e);
	if (t === null || t === Qs[tc]) return !0;
	let n = Qs.hasOwnProperty.call(t, ec) && t[ec];
	if (n === Object) return !0;
	if (!xc(n)) return !1;
	let r = lc.get(n);
	return r === void 0 && (r = Function.toString.call(n), lc.set(n, r)), r === cc;
}
function dc(e, t, n = !0) {
	fc(e) === 0 ? (n ? Reflect.ownKeys(e) : Qs.keys(e)).forEach((n) => {
		t(n, e[n], e);
	}) : e.forEach((n, r) => t(r, n, e));
}
function fc(e) {
	let t = e[Xs];
	return t ? t.type_ : _c(e) ? 1 : vc(e) ? 2 : yc(e) ? 3 : 0;
}
var pc = (e, t, n = fc(e)) => n === 2 ? e.has(t) : Qs[tc].hasOwnProperty.call(e, t), mc = (e, t, n = fc(e)) => n === 2 ? e.get(t) : e[t], hc = (e, t, n, r = fc(e)) => {
	r === 2 ? e.set(t, n) : r === 3 ? e.add(n) : e[t] = n;
};
function gc(e, t) {
	return e === t ? e !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
var _c = Array.isArray, vc = (e) => e instanceof Map, yc = (e) => e instanceof Set, bc = (e) => typeof e == "object", xc = (e) => typeof e == "function", Sc = (e) => typeof e == "boolean";
function Cc(e) {
	let t = +e;
	return Number.isInteger(t) && String(t) === e;
}
var wc = (e) => e.copy_ || e.base_, Tc = (e) => e.modified_ ? e.copy_ : e.base_;
function Ec(e, t) {
	if (vc(e)) return new Map(e);
	if (yc(e)) return new Set(e);
	if (_c(e)) return Array[tc].slice.call(e);
	let n = uc(e);
	if (t === !0 || t === "class_only" && !n) {
		let t = Qs.getOwnPropertyDescriptors(e);
		delete t[Xs];
		let n = Reflect.ownKeys(t);
		for (let r = 0; r < n.length; r++) {
			let i = n[r], a = t[i];
			a[ic] === !1 && (a[ic] = !0, a[nc] = !0), (a.get || a.set) && (t[i] = {
				[nc]: !0,
				[ic]: !0,
				[rc]: a[rc],
				[ac]: e[i]
			});
		}
		return Qs.create($s(e), t);
	}
	{
		let t = $s(e);
		if (t !== null && n) return { ...e };
		let r = Qs.create(t);
		return Qs.assign(r, e);
	}
}
function Dc(e, t = !1) {
	return Ac(e) || oc(e) || !sc(e) || (fc(e) > 1 && Qs.defineProperties(e, {
		set: kc,
		add: kc,
		clear: kc,
		delete: kc
	}), Qs.freeze(e), t && dc(e, (e, t) => {
		Dc(t, !0);
	}, !1)), e;
}
function Oc() {
	Zs(2);
}
var kc = { [ac]: Oc };
function Ac(e) {
	return e === null || !bc(e) || Qs.isFrozen(e);
}
var jc = "MapSet", Mc = "Patches", Nc = "ArrayMethods", Pc = {};
function Fc(e) {
	let t = Pc[e];
	return t || Zs(0, e), t;
}
var Ic = (e) => !!Pc[e], Lc, Rc = () => Lc, zc = (e, t) => ({
	drafts_: [],
	parent_: e,
	immer_: t,
	canAutoFreeze_: !0,
	unfinalizedDrafts_: 0,
	handledSet_: /* @__PURE__ */ new Set(),
	processedForPatches_: /* @__PURE__ */ new Set(),
	mapSetPlugin_: Ic(jc) ? Fc(jc) : void 0,
	arrayMethodsPlugin_: Ic(Nc) ? Fc(Nc) : void 0
});
function Bc(e, t) {
	t && (e.patchPlugin_ = Fc(Mc), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function Vc(e) {
	Hc(e), e.drafts_.forEach(Wc), e.drafts_ = null;
}
function Hc(e) {
	e === Lc && (Lc = e.parent_);
}
var Uc = (e) => Lc = zc(Lc, e);
function Wc(e) {
	let t = e[Xs];
	t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function Gc(e, t) {
	t.unfinalizedDrafts_ = t.drafts_.length;
	let n = t.drafts_[0];
	if (e !== void 0 && e !== n) {
		n[Xs].modified_ && (Vc(t), Zs(4)), sc(e) && (e = Kc(t, e));
		let { patchPlugin_: r } = t;
		r && r.generateReplacementPatches_(n[Xs].base_, e, t);
	} else e = Kc(t, n);
	return qc(t, e, !0), Vc(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e === Js ? void 0 : e;
}
function Kc(e, t) {
	if (Ac(t)) return t;
	let n = t[Xs];
	if (!n) return tl(t, e.handledSet_, e);
	if (!Yc(n, e)) return t;
	if (!n.modified_) return n.base_;
	if (!n.finalized_) {
		let { callbacks_: t } = n;
		if (t) for (; t.length > 0;) t.pop()(e);
		$c(n, e);
	}
	return n.copy_;
}
function qc(e, t, n = !1) {
	!e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && Dc(t, n);
}
function Jc(e) {
	e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var Yc = (e, t) => e.scope_ === t, Xc = [];
function Zc(e, t, n, r) {
	let i = wc(e), a = e.type_;
	if (r !== void 0 && mc(i, r, a) === t) {
		hc(i, r, n, a);
		return;
	}
	if (!e.draftLocations_) {
		let t = e.draftLocations_ = /* @__PURE__ */ new Map();
		dc(i, (e, n) => {
			if (oc(n)) {
				let r = t.get(n) || [];
				r.push(e), t.set(n, r);
			}
		});
	}
	let o = e.draftLocations_.get(t) ?? Xc;
	for (let e of o) hc(i, e, n, a);
}
function Qc(e, t, n) {
	e.callbacks_.push(function(r) {
		let i = t;
		if (!i || !Yc(i, r)) return;
		r.mapSetPlugin_?.fixSetContents(i);
		let a = Tc(i);
		Zc(e, i.draft_ ?? i, a, n), $c(i, r);
	});
}
function $c(e, t) {
	if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (e.assigned_?.size ?? 0) > 0)) {
		let { patchPlugin_: n } = t;
		if (n) {
			let r = n.getPath(e);
			r && n.generatePatches_(e, r, t);
		}
		Jc(e);
	}
}
function el(e, t, n) {
	let { scope_: r } = e;
	if (oc(n)) {
		let i = n[Xs];
		Yc(i, r) && i.callbacks_.push(function() {
			ul(e), Zc(e, n, Tc(i), t);
		});
	} else sc(n) && e.callbacks_.push(function() {
		let i = wc(e);
		e.type_ === 3 ? i.has(n) && tl(n, r.handledSet_, r) : mc(i, t, e.type_) === n && r.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && tl(mc(e.copy_, t, e.type_), r.handledSet_, r);
	});
}
function tl(e, t, n) {
	return !n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1 || oc(e) || t.has(e) || !sc(e) || Ac(e) || (t.add(e), dc(e, (r, i) => {
		if (oc(i)) {
			let t = i[Xs];
			Yc(t, n) && (hc(e, r, Tc(t), e.type_), Jc(t));
		} else sc(i) && tl(i, t, n);
	})), e;
}
function nl(e, t) {
	let n = _c(e), r = {
		type_: +!!n,
		scope_: t ? t.scope_ : Rc(),
		modified_: !1,
		finalized_: !1,
		assigned_: void 0,
		parent_: t,
		base_: e,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: !1,
		callbacks_: void 0
	}, i = r, a = rl;
	n && (i = [r], a = il);
	let { revoke: o, proxy: s } = Proxy.revocable(i, a);
	return r.draft_ = s, r.revoke_ = o, [s, r];
}
var rl = {
	get(e, t) {
		if (t === Xs) return e;
		let n = e.scope_.arrayMethodsPlugin_, r = e.type_ === 1 && typeof t == "string";
		if (r && n?.isArrayOperationMethod(t)) return n.createMethodInterceptor(e, t);
		let i = wc(e);
		if (!pc(i, t, e.type_)) return sl(e, i, t);
		let a = i[t];
		if (e.finalized_ || !sc(a) || r && e.operationMethod && n?.isMutatingArrayMethod(e.operationMethod) && Cc(t)) return a;
		if (a === al(e.base_, t) || ol(e, t, a)) {
			ul(e);
			let n = e.type_ === 1 ? +t : t, r = fl(e.scope_, a, e, n);
			return e.copy_[n] = r;
		}
		return a;
	},
	has(e, t) {
		return t in wc(e);
	},
	ownKeys(e) {
		return Reflect.ownKeys(wc(e));
	},
	set(e, t, n) {
		let r = cl(wc(e), t);
		if (r?.set) return r.set.call(e.draft_, n), !0;
		if (!e.modified_) {
			let r = al(wc(e), t), i = r?.[Xs];
			if (i && i.base_ === n) return e.copy_[t] = n, e.assigned_.delete(t), !0;
			if (gc(n, r) && (n !== void 0 || pc(e.base_, t, e.type_))) return !0;
			ul(e), ll(e);
		}
		return e.copy_[t] === n && (n !== void 0 || pc(e.copy_, t, e.type_)) || Number.isNaN(n) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = n, e.assigned_.set(t, !0), el(e, t, n)), !0;
	},
	deleteProperty(e, t) {
		return ul(e), al(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), ll(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = wc(e), r = Reflect.getOwnPropertyDescriptor(n, t);
		return r && {
			[ic]: !0,
			[nc]: e.type_ !== 1 || t !== "length",
			[rc]: r[rc],
			[ac]: n[t]
		};
	},
	defineProperty() {
		Zs(11);
	},
	getPrototypeOf(e) {
		return $s(e.base_);
	},
	setPrototypeOf() {
		Zs(12);
	}
}, il = {};
for (let e in rl) {
	let t = rl[e];
	il[e] = function() {
		let e = arguments;
		return e[0] = e[0][0], t.apply(this, e);
	};
}
il.deleteProperty = function(e, t) {
	return il.set.call(this, e, t, void 0);
}, il.set = function(e, t, n) {
	return rl.set.call(this, e[0], t, n, e[0]);
};
function al(e, t) {
	let n = e[Xs];
	return (n ? wc(n) : e)[t];
}
function ol(e, t, n) {
	return e.type_ !== 1 || !e.allIndicesReassigned_ || e.assigned_?.get(t) || !sc(n) || n[Xs] ? !1 : e.baseRefs_.has(n);
}
function sl(e, t, n) {
	let r = cl(t, n);
	return r ? ac in r ? r[ac] : r.get?.call(e.draft_) : void 0;
}
function cl(e, t) {
	if (!(t in e)) return;
	let n = $s(e);
	for (; n;) {
		let e = Object.getOwnPropertyDescriptor(n, t);
		if (e) return e;
		n = $s(n);
	}
}
function ll(e) {
	e.modified_ || (e.modified_ = !0, e.parent_ && ll(e.parent_));
}
function ul(e) {
	e.copy_ ||= (e.assigned_ = /* @__PURE__ */ new Map(), Ec(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var dl = class {
	constructor(e) {
		this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (e, t, n) => {
			if (xc(e) && !xc(t)) {
				let n = t;
				t = e;
				let r = this;
				return function(e = n, ...i) {
					return r.produce(e, (e) => t.call(this, e, ...i));
				};
			}
			xc(t) || Zs(6), n !== void 0 && !xc(n) && Zs(7);
			let r;
			if (sc(e)) {
				let i = Uc(this), a = fl(i, e, void 0), o = !0;
				try {
					r = t(a), o = !1;
				} finally {
					o ? Vc(i) : Hc(i);
				}
				return Bc(i, n), Gc(r, i);
			}
			if (!e || !bc(e)) {
				if (r = t(e), r === void 0 && (r = e), r === Js && (r = void 0), this.autoFreeze_ && Dc(r, !0), n) {
					let t = [], i = [];
					Fc(Mc).generateReplacementPatches_(e, r, {
						patches_: t,
						inversePatches_: i
					}), n(t, i);
				}
				return r;
			}
			Zs(1, e);
		}, this.produceWithPatches = (e, t) => {
			if (xc(e)) return (t, ...n) => this.produceWithPatches(t, (t) => e(t, ...n));
			let n, r;
			return [
				this.produce(e, t, (e, t) => {
					n = e, r = t;
				}),
				n,
				r
			];
		}, Sc(e?.autoFreeze) && this.setAutoFreeze(e.autoFreeze), Sc(e?.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), Sc(e?.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
	}
	createDraft(e) {
		sc(e) || Zs(8), oc(e) && (e = pl(e));
		let t = Uc(this), n = fl(t, e, void 0);
		return n[Xs].isManual_ = !0, Hc(t), n;
	}
	finishDraft(e, t) {
		let n = e && e[Xs];
		(!n || !n.isManual_) && Zs(9);
		let { scope_: r } = n;
		return Bc(r, t), Gc(void 0, r);
	}
	setAutoFreeze(e) {
		this.autoFreeze_ = e;
	}
	setUseStrictShallowCopy(e) {
		this.useStrictShallowCopy_ = e;
	}
	setUseStrictIteration(e) {
		this.useStrictIteration_ = e;
	}
	shouldUseStrictIteration() {
		return this.useStrictIteration_;
	}
	applyPatches(e, t) {
		let n;
		for (n = t.length - 1; n >= 0; n--) {
			let r = t[n];
			if (r.path.length === 0 && r.op === "replace") {
				e = r.value;
				break;
			}
		}
		n > -1 && (t = t.slice(n + 1));
		let r = Fc(Mc).applyPatches_;
		return oc(e) ? r(e, t) : this.produce(e, (e) => r(e, t));
	}
};
function fl(e, t, n, r) {
	let [i, a] = vc(t) ? Fc(jc).proxyMap_(t, n) : yc(t) ? Fc(jc).proxySet_(t, n) : nl(t, n);
	return (n?.scope_ ?? Rc()).drafts_.push(i), a.callbacks_ = n?.callbacks_ ?? [], a.key_ = r, n && r !== void 0 ? Qc(n, a, r) : a.callbacks_.push(function(e) {
		e.mapSetPlugin_?.fixSetContents(a);
		let { patchPlugin_: t } = e;
		a.modified_ && t && t.generatePatches_(a, [], e);
	}), i;
}
function pl(e) {
	return oc(e) || Zs(10, e), ml(e);
}
function ml(e) {
	if (!sc(e) || Ac(e)) return e;
	let t = e[Xs], n, r = !0;
	if (t) {
		if (!t.modified_) return t.base_;
		t.finalized_ = !0, n = Ec(e, t.scope_.immer_.useStrictShallowCopy_), r = t.scope_.immer_.shouldUseStrictIteration();
	} else n = Ec(e, !0);
	return dc(n, (e, t) => {
		hc(n, e, ml(t));
	}, r), t && (t.finalized_ = !1), n;
}
globalThis.Iterator?.from;
var hl = new dl().produce, G = (e) => e;
//#endregion
//#region node_modules/redux-thunk/dist/redux-thunk.mjs
function gl(e) {
	return ({ dispatch: t, getState: n }) => (r) => (i) => typeof i == "function" ? i(t, n, e) : r(i);
}
var _l = gl(), vl = gl, yl = typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
	if (arguments.length !== 0) return typeof arguments[0] == "object" ? Gs : Gs.apply(null, arguments);
};
typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__;
function bl(e, t) {
	function n(...n) {
		if (t) {
			let r = t(...n);
			if (!r) throw Error(Ou(0));
			return {
				type: e,
				payload: r.payload,
				..."meta" in r && { meta: r.meta },
				..."error" in r && { error: r.error }
			};
		}
		return {
			type: e,
			payload: n[0]
		};
	}
	return n.toString = () => `${e}`, n.type = e, n.match = (t) => qs(t) && t.type === e, n;
}
var xl = class e extends Array {
	constructor(...t) {
		super(...t), Object.setPrototypeOf(this, e.prototype);
	}
	static get [Symbol.species]() {
		return e;
	}
	concat(...e) {
		return super.concat.apply(this, e);
	}
	prepend(...t) {
		return t.length === 1 && Array.isArray(t[0]) ? new e(...t[0].concat(this)) : new e(...t.concat(this));
	}
};
function Sl(e) {
	return sc(e) ? hl(e, () => {}) : e;
}
function Cl(e, t, n) {
	return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
function wl(e) {
	return typeof e == "boolean";
}
var Tl = () => function(e) {
	let { thunk: t = !0, immutableCheck: n = !0, serializableCheck: r = !0, actionCreatorCheck: i = !0 } = e ?? {}, a = new xl();
	return t && (wl(t) ? a.push(_l) : a.push(vl(t.extraArgument))), a;
}, El = "RTK_autoBatch", Dl = () => (e) => ({
	payload: e,
	meta: { [El]: !0 }
}), Ol = (e) => (t) => {
	setTimeout(t, e);
}, kl = (e, t) => (n) => {
	let r = !1, i, a, o = () => {
		r || (r = !0, cancelAnimationFrame(i), clearTimeout(a), n());
	};
	i = e(o), a = setTimeout(o, t);
}, Al = (e = { type: "raf" }) => (t) => (...n) => {
	let r = t(...n), i = !0, a = !1, o = !1, s = /* @__PURE__ */ new Set(), c = e.type === "tick" ? queueMicrotask : e.type === "raf" ? typeof window < "u" && window.requestAnimationFrame ? kl(window.requestAnimationFrame, 100) : Ol(10) : e.type === "callback" ? e.queueNotification : Ol(e.timeout), l = () => {
		o = !1, a && (a = !1, s.forEach((e) => e()));
	};
	return Object.assign({}, r, {
		subscribe(e) {
			let t = r.subscribe(() => i && e());
			return s.add(e), () => {
				t(), s.delete(e);
			};
		},
		dispatch(e) {
			try {
				return i = !e?.meta?.[El], a = !i, a && (o || (o = !0, c(l))), r.dispatch(e);
			} finally {
				i = !0;
			}
		}
	});
}, jl = (e) => function(t) {
	let { autoBatch: n = !0 } = t ?? {}, r = new xl(e);
	return n && r.push(Al(typeof n == "object" ? n : void 0)), r;
};
function Ml(e) {
	let t = Tl(), { reducer: n = void 0, middleware: r, devTools: i = !0, duplicateMiddlewareCheck: a = !0, preloadedState: o = void 0, enhancers: s = void 0 } = e || {}, c;
	if (typeof n == "function") c = n;
	else if (Vs(n)) c = Ws(n);
	else throw Error(Ou(1));
	let l;
	l = typeof r == "function" ? r(t) : t();
	let u = Gs;
	i && (u = yl({
		trace: !1,
		...typeof i == "object" && i
	}));
	let d = jl(Ks(...l)), f = typeof s == "function" ? s(d) : d(), p = u(...f);
	return Hs(c, o, p);
}
function Nl(e) {
	let t = {}, n = [], r, i = {
		addCase(e, n) {
			let r = typeof e == "string" ? e : e.type;
			if (!r) throw Error(Ou(28));
			if (r in t) throw Error(Ou(29));
			return t[r] = n, i;
		},
		addAsyncThunk(e, r) {
			return r.pending && (t[e.pending.type] = r.pending), r.rejected && (t[e.rejected.type] = r.rejected), r.fulfilled && (t[e.fulfilled.type] = r.fulfilled), r.settled && n.push({
				matcher: e.settled,
				reducer: r.settled
			}), i;
		},
		addMatcher(e, t) {
			return n.push({
				matcher: e,
				reducer: t
			}), i;
		},
		addDefaultCase(e) {
			return r = e, i;
		}
	};
	return e(i), [
		t,
		n,
		r
	];
}
function Pl(e) {
	return typeof e == "function";
}
function Fl(e, t) {
	let [n, r, i] = Nl(t), a;
	if (Pl(e)) a = () => Sl(e());
	else {
		let t = Sl(e);
		a = () => t;
	}
	function o(e = a(), t) {
		let o = [n[t.type], ...r.filter(({ matcher: e }) => e(t)).map(({ reducer: e }) => e)];
		return o.filter((e) => !!e).length === 0 && (o = [i]), o.reduce((e, n) => {
			if (n) {
				if (oc(e)) {
					let r = n(e, t);
					return r === void 0 ? e : r;
				}
				if (sc(e)) return hl(e, (e) => n(e, t));
				{
					let r = n(e, t);
					if (r === void 0) {
						if (e === null) return e;
						throw Error(Ou(9));
					}
					return r;
				}
			}
			return e;
		}, e);
	}
	return o.getInitialState = a, o;
}
var Il = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", Ll = (e = 21) => {
	let t = "", n = e;
	for (; n--;) t += Il[Math.random() * 64 | 0];
	return t;
}, Rl = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function zl(e, t) {
	return `${e}/${t}`;
}
function Bl({ creators: e } = {}) {
	let t = e?.asyncThunk?.[Rl];
	return function(e) {
		let { name: n, reducerPath: r = n } = e;
		if (!n) throw Error(Ou(11));
		let i = (typeof e.reducers == "function" ? e.reducers(Ul()) : e.reducers) || {}, a = Object.keys(i), o = {
			sliceCaseReducersByName: {},
			sliceCaseReducersByType: {},
			actionCreators: {},
			sliceMatchers: []
		}, s = {
			addCase(e, t) {
				let n = typeof e == "string" ? e : e.type;
				if (!n) throw Error(Ou(12));
				if (n in o.sliceCaseReducersByType) throw Error(Ou(13));
				return o.sliceCaseReducersByType[n] = t, s;
			},
			addMatcher(e, t) {
				return o.sliceMatchers.push({
					matcher: e,
					reducer: t
				}), s;
			},
			exposeAction(e, t) {
				return o.actionCreators[e] = t, s;
			},
			exposeCaseReducer(e, t) {
				return o.sliceCaseReducersByName[e] = t, s;
			}
		};
		a.forEach((r) => {
			let a = i[r], o = {
				reducerName: r,
				type: zl(n, r),
				createNotation: typeof e.reducers == "function"
			};
			Gl(a) ? ql(o, a, s, t) : Wl(o, a, s);
		});
		function c() {
			let [t = {}, n = [], r = void 0] = typeof e.extraReducers == "function" ? Nl(e.extraReducers) : [e.extraReducers], i = {
				...t,
				...o.sliceCaseReducersByType
			};
			return Fl(e.initialState, (e) => {
				for (let t in i) e.addCase(t, i[t]);
				for (let t of o.sliceMatchers) e.addMatcher(t.matcher, t.reducer);
				for (let t of n) e.addMatcher(t.matcher, t.reducer);
				r && e.addDefaultCase(r);
			});
		}
		let l = (e) => e, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new WeakMap(), f;
		function p(e, t) {
			return f ||= c(), f(e, t);
		}
		function m() {
			return f ||= c(), f.getInitialState();
		}
		function h(t, n = !1) {
			function r(e) {
				let i = e[t];
				return i === void 0 && n && (i = Cl(d, r, m)), i;
			}
			function i(t = l) {
				return Cl(Cl(u, n, () => /* @__PURE__ */ new WeakMap()), t, () => {
					let r = {};
					for (let [i, a] of Object.entries(e.selectors ?? {})) r[i] = Vl(a, t, () => Cl(d, t, m), n);
					return r;
				});
			}
			return {
				reducerPath: t,
				getSelectors: i,
				get selectors() {
					return i(r);
				},
				selectSlice: r
			};
		}
		let g = {
			name: n,
			reducer: p,
			actions: o.actionCreators,
			caseReducers: o.sliceCaseReducersByName,
			getInitialState: m,
			...h(r),
			injectInto(e, { reducerPath: t, ...n } = {}) {
				let i = t ?? r;
				return e.inject({
					reducerPath: i,
					reducer: p
				}, n), {
					...g,
					...h(i, !0)
				};
			}
		};
		return g;
	};
}
function Vl(e, t, n, r) {
	function i(i, ...a) {
		let o = t(i);
		return o === void 0 && r && (o = n()), e(o, ...a);
	}
	return i.unwrapped = e, i;
}
var Hl = /* @__PURE__ */ Bl();
function Ul() {
	function e(e, t) {
		return {
			_reducerDefinitionType: "asyncThunk",
			payloadCreator: e,
			...t
		};
	}
	return e.withTypes = () => e, {
		reducer(e) {
			return Object.assign({ [e.name](...t) {
				return e(...t);
			} }[e.name], { _reducerDefinitionType: "reducer" });
		},
		preparedReducer(e, t) {
			return {
				_reducerDefinitionType: "reducerWithPrepare",
				prepare: e,
				reducer: t
			};
		},
		asyncThunk: e
	};
}
function Wl({ type: e, reducerName: t, createNotation: n }, r, i) {
	let a, o;
	if ("reducer" in r) {
		if (n && !Kl(r)) throw Error(Ou(17));
		a = r.reducer, o = r.prepare;
	} else a = r;
	i.addCase(e, a).exposeCaseReducer(t, a).exposeAction(t, o ? bl(e, o) : bl(e));
}
function Gl(e) {
	return e._reducerDefinitionType === "asyncThunk";
}
function Kl(e) {
	return e._reducerDefinitionType === "reducerWithPrepare";
}
function ql({ type: e, reducerName: t }, n, r, i) {
	if (!i) throw Error(Ou(18));
	let { payloadCreator: a, fulfilled: o, pending: s, rejected: c, settled: l, options: u } = n, d = i(e, a, u);
	r.exposeAction(t, d), o && r.addCase(d.fulfilled, o), s && r.addCase(d.pending, s), c && r.addCase(d.rejected, c), l && r.addMatcher(d.settled, l), r.exposeCaseReducer(t, {
		fulfilled: o || Jl,
		pending: s || Jl,
		rejected: c || Jl,
		settled: l || Jl
	});
}
function Jl() {}
var Yl = "task", Xl = "listener", Zl = "completed", Ql = "cancelled", $l = `task-${Ql}`, eu = `task-${Zl}`, tu = `${Xl}-${Ql}`, nu = `${Xl}-${Zl}`, ru = class {
	code;
	name = "TaskAbortError";
	message;
	constructor(e) {
		this.code = e, this.message = `${Yl} ${Ql} (reason: ${e})`;
	}
}, K = (e, t) => {
	if (typeof e != "function") throw TypeError(Ou(32));
}, iu = () => {}, au = (e, t = iu) => (e.catch(t), e), ou = (e, t) => (e.addEventListener("abort", t, { once: !0 }), () => e.removeEventListener("abort", t)), su = (e) => {
	if (e.aborted) throw new ru(e.reason);
};
function cu(e, t) {
	let n = iu;
	return new Promise((r, i) => {
		let a = () => i(new ru(e.reason));
		e.aborted ? a() : (n = ou(e, a), t.finally(() => n()).then(r, i));
	}).finally(() => {
		n = iu;
	});
}
var lu = async (e, t) => {
	try {
		return await Promise.resolve(), {
			status: "ok",
			value: await e()
		};
	} catch (e) {
		return {
			status: e instanceof ru ? "cancelled" : "rejected",
			error: e
		};
	} finally {
		t?.();
	}
}, uu = (e) => (t) => au(cu(e, t).then((t) => (su(e), t))), du = (e) => {
	let t = uu(e);
	return (e) => t(new Promise((t) => setTimeout(t, e)));
}, { assign: fu } = Object, pu = {}, mu = "listenerMiddleware", hu = (e, t) => {
	let n = (t) => ou(e, () => t.abort(e.reason));
	return (r, i) => {
		K(r, "taskExecutor");
		let a = new AbortController();
		n(a);
		let o = lu(async () => {
			su(e), su(a.signal);
			let t = await r({
				pause: uu(a.signal),
				delay: du(a.signal),
				signal: a.signal
			});
			return su(a.signal), t;
		}, () => a.abort(eu));
		return i?.autoJoin && t.push(o.catch(iu)), {
			result: uu(e)(o),
			cancel() {
				a.abort($l);
			}
		};
	};
}, gu = (e, t) => {
	let n = async (n, r) => {
		su(t);
		let i = () => {}, a = [new Promise((t, r) => {
			let a = e({
				predicate: n,
				effect: (e, n) => {
					n.unsubscribe(), t([
						e,
						n.getState(),
						n.getOriginalState()
					]);
				}
			});
			i = () => {
				a(), r();
			};
		})];
		r != null && a.push(new Promise((e) => setTimeout(e, r, null)));
		try {
			let e = await cu(t, Promise.race(a));
			return su(t), e;
		} finally {
			i();
		}
	};
	return ((e, t) => au(n(e, t)));
}, _u = (e) => {
	let { type: t, actionCreator: n, matcher: r, predicate: i, effect: a } = e;
	if (t) i = bl(t).match;
	else if (n) t = n.type, i = n.match;
	else if (r) i = r;
	else if (!i) throw Error(Ou(21));
	return K(a, "options.listener"), {
		predicate: i,
		type: t,
		effect: a
	};
}, vu = /* @__PURE__ */ fu((e) => {
	let { type: t, predicate: n, effect: r } = _u(e);
	return {
		id: Ll(),
		effect: r,
		type: t,
		predicate: n,
		pending: /* @__PURE__ */ new Set(),
		unsubscribe: () => {
			throw Error(Ou(22));
		}
	};
}, { withTypes: () => vu }), yu = (e, t) => {
	let { type: n, effect: r, predicate: i } = _u(t);
	return Array.from(e.values()).find((e) => (typeof n == "string" ? e.type === n : e.predicate === i) && e.effect === r);
}, bu = (e) => {
	e.pending.forEach((e) => {
		e.abort(tu);
	});
}, xu = (e, t) => () => {
	for (let e of t.keys()) bu(e);
	e.clear();
}, Su = (e, t, n) => {
	try {
		e(t, n);
	} catch (e) {
		setTimeout(() => {
			throw e;
		}, 0);
	}
}, Cu = /* @__PURE__ */ fu(/* @__PURE__ */ bl(`${mu}/add`), { withTypes: () => Cu }), wu = /* @__PURE__ */ bl(`${mu}/removeAll`), Tu = /* @__PURE__ */ fu(/* @__PURE__ */ bl(`${mu}/remove`), { withTypes: () => Tu }), Eu = (...e) => {
	console.error(`${mu}/error`, ...e);
}, Du = (e = {}) => {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e) ?? 0;
		n.set(e, t + 1);
	}, i = (e) => {
		let t = n.get(e) ?? 1;
		t === 1 ? n.delete(e) : n.set(e, t - 1);
	}, { extra: a, onError: o = Eu } = e;
	K(o, "onError");
	let s = (e) => (e.unsubscribe = () => t.delete(e.id), t.set(e.id, e), (t) => {
		e.unsubscribe(), t?.cancelActive && bu(e);
	}), c = ((e) => {
		let n = yu(t, e) ?? vu(e);
		return s(n);
	});
	fu(c, { withTypes: () => c });
	let l = (e) => {
		let n = yu(t, e);
		return n && (n.unsubscribe(), e.cancelActive && bu(n)), !!n;
	};
	fu(l, { withTypes: () => l });
	let u = async (e, n, s, l) => {
		let u = new AbortController(), d = gu(c, u.signal), f = [];
		try {
			e.pending.add(u), r(e), await Promise.resolve(e.effect(n, fu({}, s, {
				getOriginalState: l,
				condition: (e, t) => d(e, t).then(Boolean),
				take: d,
				delay: du(u.signal),
				pause: uu(u.signal),
				extra: a,
				signal: u.signal,
				fork: hu(u.signal, f),
				unsubscribe: e.unsubscribe,
				subscribe: () => {
					t.set(e.id, e);
				},
				cancelActiveListeners: () => {
					e.pending.forEach((e, t, n) => {
						e !== u && (e.abort(tu), n.delete(e));
					});
				},
				cancel: () => {
					u.abort(tu), e.pending.delete(u);
				},
				throwIfCancelled: () => {
					su(u.signal);
				}
			})));
		} catch (e) {
			e instanceof ru || Su(o, e, { raisedBy: "effect" });
		} finally {
			await Promise.all(f), u.abort(nu), i(e), e.pending.delete(u);
		}
	}, d = xu(t, n);
	return {
		middleware: (e) => (n) => (r) => {
			if (!qs(r)) return n(r);
			if (Cu.match(r)) return c(r.payload);
			if (wu.match(r)) {
				d();
				return;
			}
			if (Tu.match(r)) return l(r.payload);
			let i = e.getState(), a = () => {
				if (i === pu) throw Error(Ou(23));
				return i;
			}, s;
			try {
				if (s = n(r), t.size > 0) {
					let n = e.getState(), s = Array.from(t.values());
					for (let t of s) {
						let s = !1;
						try {
							s = t.predicate(r, n, i);
						} catch (e) {
							s = !1, Su(o, e, { raisedBy: "predicate" });
						}
						s && u(t, r, e, a);
					}
				}
			} finally {
				i = pu;
			}
			return s;
		},
		startListening: c,
		stopListening: l,
		clearListeners: d
	};
};
function Ou(e) {
	return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
//#endregion
//#region node_modules/recharts/es6/state/layoutSlice.js
var ku = Hl({
	name: "chartLayout",
	initialState: {
		layoutType: "horizontal",
		width: 0,
		height: 0,
		margin: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		scale: 1
	},
	reducers: {
		setLayout(e, t) {
			e.layoutType = t.payload;
		},
		setChartSize(e, t) {
			e.width = t.payload.width, e.height = t.payload.height;
		},
		setMargin(e, t) {
			e.margin.top = t.payload.top ?? 0, e.margin.right = t.payload.right ?? 0, e.margin.bottom = t.payload.bottom ?? 0, e.margin.left = t.payload.left ?? 0;
		},
		setScale(e, t) {
			e.scale = t.payload;
		}
	}
}), Au = ku.actions, ju = Au.setMargin, Mu = Au.setLayout, Nu = Au.setChartSize, Pu = Au.setScale, Fu = ku.reducer;
//#endregion
//#region node_modules/recharts/es6/util/getSliced.js
function Iu(e, t, n) {
	return Array.isArray(e) && e && t + n !== 0 ? e.slice(t, n + 1) : e;
}
//#endregion
//#region node_modules/recharts/es6/util/isWellBehavedNumber.js
function q(e) {
	return Number.isFinite(e);
}
function Lu(e) {
	return typeof e == "number" && e > 0 && Number.isFinite(e);
}
//#endregion
//#region node_modules/recharts/es6/util/ChartUtils.js
function Ru(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function zu(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ru(Object(n), !0).forEach(function(t) {
			Bu(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ru(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Bu(e, t, n) {
	return (t = Vu(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Vu(e) {
	var t = Hu(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Hu(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Uu(e, t, n) {
	return mi(e) || mi(t) ? n : si(t) ? $r(e, t, n) : typeof t == "function" ? t(e) : n;
}
var Wu = (e, t, n) => {
	if (t && n) {
		var r = n.width, i = n.height, a = t.align, o = t.verticalAlign, s = t.layout, c = t.position, l = t.offset, u = l === void 0 ? 0 : l;
		if (c != null) {
			if (Ei(c)) {
				if (c === "top" && B(e.top)) return zu(zu({}, e), {}, { top: e.top + (i || 0) + u });
				if (c === "bottom" && B(e.bottom)) return zu(zu({}, e), {}, { bottom: e.bottom + (i || 0) + u });
				if (c === "left" && B(e.left)) return zu(zu({}, e), {}, { left: e.left + (r || 0) + u });
				if (c === "right" && B(e.right)) return zu(zu({}, e), {}, { right: e.right + (r || 0) + u });
			}
			return e;
		}
		if ((s === "vertical" || s === "horizontal" && o === "middle") && a !== "center" && B(e[a])) return zu(zu({}, e), {}, { [a]: e[a] + (r || 0) });
		if ((s === "horizontal" || s === "vertical" && a === "center") && o !== "middle" && B(e[o])) return zu(zu({}, e), {}, { [o]: e[o] + (i || 0) });
	}
	return e;
}, Gu = (e, t) => e === "horizontal" && t === "xAxis" || e === "vertical" && t === "yAxis" || e === "centric" && t === "angleAxis" || e === "radial" && t === "radiusAxis", Ku = (e, t, n, r) => {
	if (r) return e.map((e) => e.coordinate);
	var i, a, o = e.map((e) => (e.coordinate === t && (i = !0), e.coordinate === n && (a = !0), e.coordinate));
	return i || o.push(t), a || o.push(n), o;
}, qu = (e, t, n) => {
	if (!e) return null;
	var r = e.duplicateDomain, i = e.type, a = e.range, o = e.scale, s = e.realScaleType, c = e.isCategorical, l = e.categoricalDomain, u = e.tickCount, d = e.ticks, f = e.niceTicks, p = e.axisType;
	if (!o) return null;
	var m = s === "scaleBand" && o.bandwidth ? o.bandwidth() / 2 : 2, h = (t || n) && i === "category" && o.bandwidth ? o.bandwidth() / m : 0;
	return h = p === "angleAxis" && a && a.length >= 2 ? ii(a[0] - a[1]) * 2 * h : h, t && (d || f) ? (d || f || []).map((e, t) => {
		var n = r ? r.indexOf(e) : e, i = o.map(n);
		return q(i) ? {
			coordinate: i + h,
			value: e,
			offset: h,
			index: t
		} : null;
	}).filter(gi) : c && l ? l.map((e, t) => {
		var n = o.map(e);
		return q(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(gi) : o.ticks && !n && u != null ? o.ticks(u).map((e, t) => {
		var n = o.map(e);
		return q(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(gi) : o.domain().map((e, t) => {
		var n = o.map(e);
		return q(n) ? {
			coordinate: n + h,
			value: r ? r[e] : e,
			index: t,
			offset: h
		} : null;
	}).filter(gi);
}, Ju = {
	sign: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0, o = 0; o < t; ++o) {
				var s = e[o]?.[r];
				if (s != null) {
					var c = s[1], l = s[0], u = ai(c) ? l : c;
					u >= 0 ? (s[0] = i, i += u, s[1] = i) : (s[0] = a, a += u, s[1] = a);
				}
			}
		}
	},
	expand: Ca,
	none: va,
	silhouette: wa,
	wiggle: Ta,
	positive: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0; a < t; ++a) {
				var o = e[a]?.[r];
				if (o != null) {
					var s = ai(o[1]) ? o[0] : o[1];
					s >= 0 ? (o[0] = i, i += s, o[1] = i) : (o[0] = 0, o[1] = 0);
				}
			}
		}
	}
}, Yu = (e, t, n) => {
	var r = Ju[n] ?? va, i = Sa().keys(t).value((e, t) => Number(Uu(e, t, 0))).order(ya).offset(r)(e);
	return i.forEach((n, r) => {
		n.forEach((n, i) => {
			var a = Uu(e[i], t[r], 0);
			Array.isArray(a) && a.length === 2 && B(a[0]) && B(a[1]) && (n[0] = a[0], n[1] = a[1]);
		});
	}), i;
};
function Xu(e) {
	var t = e.axis, n = e.ticks, r = e.bandSize, i = e.entry, a = e.index, o = e.dataKey;
	if (t.type === "category") {
		if (!t.allowDuplicatedCategory && t.dataKey && !mi(i[t.dataKey])) {
			var s = pi(n, "value", i[t.dataKey]);
			if (s) return s.coordinate + r / 2;
		}
		return n != null && n[a] ? n[a].coordinate + r / 2 : null;
	}
	var c = Uu(i, mi(o) ? t.dataKey : o), l = t.scale.map(c);
	return B(l) ? l : null;
}
var Zu = (e) => {
	var t = e.flat(2).filter(B);
	return [Math.min(...t), Math.max(...t)];
}, Qu = (e) => [e[0] === Infinity ? 0 : e[0], e[1] === -Infinity ? 0 : e[1]], $u = (e, t, n) => {
	if (e != null && Object.keys(e).length !== 0) return Qu(Object.keys(e).reduce((r, i) => {
		var a = e[i];
		if (!a) return r;
		var o = a.stackedData.reduce((e, r) => {
			var i = Zu(Iu(r, t, n));
			return !q(i[0]) || !q(i[1]) ? e : [Math.min(e[0], i[0]), Math.max(e[1], i[1])];
		}, [Infinity, -Infinity]);
		return [Math.min(o[0], r[0]), Math.max(o[1], r[1])];
	}, [Infinity, -Infinity]));
}, J = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, Y = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, ed = (e, t, n) => {
	if (e && e.scale && e.scale.bandwidth) {
		var r = e.scale.bandwidth();
		if (!n || r > 0) return r;
	}
	if (e && t && t.length >= 2) {
		for (var i = ws(t, (e) => e.coordinate), a = [], o = 0, s = 1, c = i.length; s < c; s++) {
			var l = (i[s]?.coordinate || 0) - (i[s - 1]?.coordinate || 0);
			a.push(l), o = Math.max(l, o);
		}
		var u = o * 1e-4, d = Infinity;
		for (var f of a) f > u && (d = Math.min(f, d));
		return d === Infinity ? 0 : d;
	}
	return n ? void 0 : 0;
};
function td(e) {
	var t = e.tooltipEntrySettings, n = e.dataKey, r = e.payload, i = e.value, a = e.name;
	return zu(zu({}, t), {}, {
		dataKey: n,
		payload: r,
		value: i,
		name: a
	});
}
function nd(e, t) {
	if (e != null) return String(e);
	if (typeof t == "string") return t;
}
var rd = (e, t) => {
	if (t === "horizontal") return e.relativeX;
	if (t === "vertical") return e.relativeY;
}, id = (e, t) => t === "centric" ? e.angle : e.radius, ad = (e) => e.layout.width, od = (e) => e.layout.height, sd = (e) => e.layout.scale, cd = (e) => e.layout.margin, ld = W((e) => e.cartesianAxis.xAxis, (e) => Object.values(e)), ud = W((e) => e.cartesianAxis.yAxis, (e) => Object.values(e)), dd = "data-recharts-item-index";
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
function fd(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pd(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fd(Object(n), !0).forEach(function(t) {
			md(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fd(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function md(e, t, n) {
	return (t = hd(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hd(e) {
	var t = gd(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gd(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var _d = (e) => e.brush.height;
function vd(e) {
	return ud(e).reduce((e, t) => t.orientation === "left" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function yd(e) {
	return ud(e).reduce((e, t) => t.orientation === "right" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function bd(e) {
	return ld(e).reduce((e, t) => t.orientation === "top" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
function xd(e) {
	return ld(e).reduce((e, t) => t.orientation === "bottom" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
var Sd = W([
	ad,
	od,
	cd,
	_d,
	vd,
	yd,
	bd,
	xd,
	Ts,
	Es
], (e, t, n, r, i, a, o, s, c, l) => {
	var u = {
		left: (n.left || 0) + i,
		right: (n.right || 0) + a
	}, d = pd(pd({}, {
		top: (n.top || 0) + o,
		bottom: (n.bottom || 0) + s
	}), u), f = d.bottom;
	d.bottom += r, d = Wu(d, c, l);
	var p = e - d.left - d.right, m = t - d.top - d.bottom;
	return pd(pd({ brushBottom: f }, d), {}, {
		width: Math.max(p, 0),
		height: Math.max(m, 0)
	});
}), Cd = W(Sd, (e) => ({
	x: e.left,
	y: e.top,
	width: e.width,
	height: e.height
})), wd = W(ad, od, (e, t) => ({
	x: 0,
	y: 0,
	width: e,
	height: t
})), Td = /*#__PURE__*/ (0, y.createContext)(null), Ed = () => (0, y.useContext)(Td) != null, Dd = (e) => e.brush, Od = W([
	Dd,
	Sd,
	cd
], (e, t, n) => ({
	height: e.height,
	x: B(e.x) ? e.x : t.left,
	y: B(e.y) ? e.y : t.top + t.height + t.brushBottom - (n?.bottom || 0),
	width: B(e.width) ? e.width : t.width
}));
//#endregion
//#region node_modules/es-toolkit/dist/function/debounce.mjs
function kd(e, t, { signal: n, edges: r } = {}) {
	let i, a = null, o = r != null && r.includes("leading"), s = r == null || r.includes("trailing"), c = () => {
		a !== null && (e.apply(i, a), i = void 0, a = null);
	}, l = () => {
		s && c(), p();
	}, u = null, d = () => {
		u != null && clearTimeout(u), u = setTimeout(() => {
			u = null, l();
		}, t);
	}, f = () => {
		u !== null && (clearTimeout(u), u = null);
	}, p = () => {
		f(), i = void 0, a = null;
	}, m = () => {
		c();
	}, h = function(...e) {
		if (n?.aborted) return;
		i = this, a = e;
		let t = u == null;
		d(), o && t && c();
	};
	return h.schedule = d, h.cancel = p, h.flush = m, n?.addEventListener("abort", p, { once: !0 }), h;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/function/debounce.mjs
function Ad(e, t = 0, n = {}) {
	typeof n != "object" && (n = {});
	let { leading: r = !1, trailing: i = !0, maxWait: a } = n, o = [, ,];
	r && (o[0] = "leading"), i && (o[1] = "trailing");
	let s, c = null, l = kd(function(...t) {
		s = e.apply(this, t), c = null;
	}, t, { edges: o }), u = function(...t) {
		return a != null && (c === null && (c = Date.now()), Date.now() - c >= a) ? ((r || i) && (s = e.apply(this, t)), c = Date.now(), l.cancel(), l.schedule(), s) : (l.apply(this, t), s);
	};
	return u.cancel = l.cancel, u.flush = () => (l.flush(), s), u;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/function/throttle.mjs
function jd(e, t = 0, n = {}) {
	let { leading: r = !0, trailing: i = !0 } = n;
	return Ad(e, t, {
		leading: r,
		maxWait: t,
		trailing: i
	});
}
//#endregion
//#region node_modules/recharts/es6/util/LogUtils.js
var Md = function(e, t) {
	var n = [...arguments].slice(2);
	if (typeof console < "u" && console.warn && (t === void 0 && console.warn("LogUtils requires an error message argument"), !e)) {
		if (t === void 0) console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
		else {
			var r = 0;
			console.warn(t.replace(/%s/g, () => n[r++]));
		}
	}
}, Nd = {
	width: "100%",
	height: "100%",
	debounce: 0,
	minWidth: 0,
	initialDimension: {
		width: -1,
		height: -1
	}
}, Pd = (e, t, n) => {
	var r = n.width, i = r === void 0 ? Nd.width : r, a = n.height, o = a === void 0 ? Nd.height : a, s = n.aspect, c = n.maxHeight, l = oi(i) ? e : Number(i), u = oi(o) ? t : Number(o);
	return s && s > 0 && (l ? u = l / s : u && (l = u * s), c && u != null && u > c && (u = c)), {
		calculatedWidth: l,
		calculatedHeight: u
	};
}, Fd = {
	width: 0,
	height: 0,
	overflow: "visible"
}, Id = {
	width: 0,
	overflowX: "visible"
}, Ld = {
	height: 0,
	overflowY: "visible"
}, Rd = {}, zd = (e) => {
	var t = e.width, n = e.height, r = oi(t), i = oi(n);
	return r && i ? Fd : r ? Id : i ? Ld : Rd;
};
function Bd(e) {
	var t = e.width, n = e.height, r = e.aspect, i = t, a = n;
	return i === void 0 && a === void 0 ? (i = Nd.width, a = Nd.height) : i === void 0 ? i = r && r > 0 ? void 0 : Nd.width : a === void 0 && (a = r && r > 0 ? void 0 : Nd.height), {
		width: i,
		height: a
	};
}
//#endregion
//#region node_modules/recharts/es6/component/ResponsiveContainer.js
var Vd = [
	"aspect",
	"initialDimension",
	"width",
	"height",
	"minWidth",
	"minHeight",
	"maxHeight",
	"children",
	"debounce",
	"id",
	"className",
	"onResize",
	"style"
];
function Hd() {
	return Hd = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Hd.apply(null, arguments);
}
function Ud(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Wd(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ud(Object(n), !0).forEach(function(t) {
			Gd(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ud(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Gd(e, t, n) {
	return (t = Kd(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Kd(e) {
	var t = qd(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function qd(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Jd(e, t) {
	return $d(e) || Qd(e, t) || Xd(e, t) || Yd();
}
function Yd() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Xd(e, t) {
	if (e) {
		if (typeof e == "string") return Zd(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zd(e, t) : void 0;
	}
}
function Zd(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Qd(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function $d(e) {
	if (Array.isArray(e)) return e;
}
function ef(e, t) {
	if (e == null) return {};
	var n, r, i = tf(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function tf(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var nf = /*#__PURE__*/ (0, y.createContext)(Nd.initialDimension);
function rf(e) {
	return Lu(e.width) && Lu(e.height);
}
function af(e) {
	var t = e.children, n = e.width, r = e.height, i = (0, y.useMemo)(() => ({
		width: n,
		height: r
	}), [n, r]);
	return rf(i) ? /*#__PURE__*/ y.createElement(nf.Provider, { value: i }, t) : null;
}
var of = () => (0, y.useContext)(nf), sf = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.aspect, r = e.initialDimension, i = r === void 0 ? Nd.initialDimension : r, a = e.width, o = e.height, s = e.minWidth, c = s === void 0 ? Nd.minWidth : s, l = e.minHeight, u = e.maxHeight, d = e.children, f = e.debounce, p = f === void 0 ? Nd.debounce : f, m = e.id, h = e.className, g = e.onResize, _ = e.style, v = _ === void 0 ? {} : _, b = ef(e, Vd), x = (0, y.useRef)(null), S = (0, y.useRef)();
	S.current = g, (0, y.useImperativeHandle)(t, () => x.current);
	var C = Jd((0, y.useState)({
		containerWidth: i.width,
		containerHeight: i.height
	}), 2), w = C[0], T = C[1], E = (0, y.useCallback)((e, t) => {
		T((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []);
	(0, y.useEffect)(() => {
		if (x.current == null || typeof ResizeObserver > "u") return _i;
		var e = (e) => {
			var t, n = e[0];
			if (n != null) {
				var r = n.contentRect, i = r.width, a = r.height;
				E(i, a), (t = S.current) == null || t.call(S, i, a);
			}
		};
		p > 0 && (e = jd(e, p, {
			trailing: !0,
			leading: !1
		}));
		var t = new ResizeObserver(e), n = x.current.getBoundingClientRect(), r = n.width, i = n.height;
		return E(r, i), t.observe(x.current), () => {
			t.disconnect();
		};
	}, [E, p]);
	var D = w.containerWidth, O = w.containerHeight;
	Md(!n || n > 0, "The aspect(%s) must be greater than zero.", n);
	var k = Pd(D, O, {
		width: a,
		height: o,
		aspect: n,
		maxHeight: u
	}), A = k.calculatedWidth, j = k.calculatedHeight;
	return Md(D < 0 || O < 0 || A != null && A > 0 || j != null && j > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", A, j, a, o, c, l, n), /*#__PURE__*/ y.createElement("div", Hd({
		id: m ? `${m}` : void 0,
		className: Tr("recharts-responsive-container", h),
		style: Wd(Wd({}, v), {}, {
			width: a,
			height: o,
			minWidth: c,
			minHeight: l,
			maxHeight: u
		}),
		ref: x
	}, b), /*#__PURE__*/ y.createElement("div", { style: zd({
		width: a,
		height: o
	}) }, /*#__PURE__*/ y.createElement(af, {
		width: A,
		height: j
	}, d)));
}), cf = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = of();
	if (Lu(n.width) && Lu(n.height)) return e.children;
	var r = Bd({
		width: e.width,
		height: e.height,
		aspect: e.aspect
	}), i = r.width, a = r.height, o = Pd(void 0, void 0, {
		width: i,
		height: a,
		aspect: e.aspect,
		maxHeight: e.maxHeight
	}), s = o.calculatedWidth, c = o.calculatedHeight;
	return B(s) && B(c) ? /*#__PURE__*/ y.createElement(af, {
		width: s,
		height: c
	}, e.children) : /*#__PURE__*/ y.createElement(sf, Hd({}, e, {
		width: i,
		height: a,
		ref: t
	}));
}), lf = () => {
	var e = Ed(), t = U(Cd), n = U(Od), r = U(Dd)?.padding;
	return !e || !n || !r ? t : {
		width: n.width - r.left - r.right,
		height: n.height - r.top - r.bottom,
		x: r.left,
		y: r.top
	};
}, uf = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
	brushBottom: 0
}, df = () => U(Sd) ?? uf, ff = () => U(ad), pf = () => U(od), mf = (e) => e.layout.layoutType, X = () => U(mf), hf = () => {
	var e = X();
	if (e === "horizontal" || e === "vertical") return e;
}, gf = (e) => {
	var t = e.layout.layoutType;
	if (t === "centric" || t === "radial") return t;
}, _f = () => X() !== void 0, vf = (e) => {
	var t = $o(), n = Ed(), r = e.width, i = e.height, a = of(), o = r, s = i;
	return a && (o = a.width > 0 ? a.width : r, s = a.height > 0 ? a.height : i), (0, y.useEffect)(() => {
		!n && Lu(o) && Lu(s) && t(Nu({
			width: o,
			height: s
		}));
	}, [
		t,
		n,
		o,
		s
	]), null;
}, yf = Hl({
	name: "legend",
	initialState: {
		settings: {
			layout: "horizontal",
			align: "center",
			verticalAlign: "bottom",
			itemSorter: "value",
			position: void 0,
			offset: 0
		},
		size: {
			width: 0,
			height: 0
		},
		payload: []
	},
	reducers: {
		setLegendSize(e, t) {
			e.size.width = t.payload.width, e.size.height = t.payload.height;
		},
		setLegendSettings(e, t) {
			e.settings.align = t.payload.align, e.settings.layout = t.payload.layout, e.settings.verticalAlign = t.payload.verticalAlign, e.settings.itemSorter = t.payload.itemSorter, e.settings.position = t.payload.position, e.settings.offset = t.payload.offset;
		},
		addLegendPayload: {
			reducer(e, t) {
				e.payload.push(G(t.payload));
			},
			prepare: Dl()
		},
		replaceLegendPayload: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = pl(e).payload.indexOf(G(r));
				a > -1 && (e.payload[a] = G(i));
			},
			prepare: Dl()
		},
		removeLegendPayload: {
			reducer(e, t) {
				var n = pl(e).payload.indexOf(G(t.payload));
				n > -1 && e.payload.splice(n, 1);
			},
			prepare: Dl()
		}
	}
}), bf = yf.actions;
bf.setLegendSize, bf.setLegendSettings;
var xf = bf.addLegendPayload, Sf = bf.replaceLegendPayload, Cf = bf.removeLegendPayload, wf = yf.reducer, Tf = /* @__PURE__ */ s(((e) => {
	var t = m();
	t.useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
}));
(/* @__PURE__ */ s(((e, t) => {
	t.exports = Tf();
})))();
function Ef(e) {
	e();
}
function Df() {
	let e = null, t = null;
	return {
		clear() {
			e = null, t = null;
		},
		notify() {
			Ef(() => {
				let t = e;
				for (; t;) t.callback(), t = t.next;
			});
		},
		get() {
			let t = [], n = e;
			for (; n;) t.push(n), n = n.next;
			return t;
		},
		subscribe(n) {
			let r = !0, i = t = {
				callback: n,
				next: null,
				prev: t
			};
			return i.prev ? i.prev.next = i : e = i, function() {
				r && e !== null && (r = !1, i.next ? i.next.prev = i.prev : t = i.prev, i.prev ? i.prev.next = i.next : e = i.next);
			};
		}
	};
}
var Of = {
	notify() {},
	get: () => []
};
function kf(e, t) {
	let n, r = Of, i = 0, a = !1;
	function o(e) {
		u();
		let t = r.subscribe(e), n = !1;
		return () => {
			n || (n = !0, t(), d());
		};
	}
	function s() {
		r.notify();
	}
	function c() {
		m.onStateChange && m.onStateChange();
	}
	function l() {
		return a;
	}
	function u() {
		i++, n || (n = t ? t.addNestedSub(c) : e.subscribe(c), r = Df());
	}
	function d() {
		i--, n && i === 0 && (n(), n = void 0, r.clear(), r = Of);
	}
	function f() {
		a || (a = !0, u());
	}
	function p() {
		a && (a = !1, d());
	}
	let m = {
		addNestedSub: o,
		notifyNestedSubs: s,
		handleChangeWrapper: c,
		isSubscribed: l,
		trySubscribe: f,
		tryUnsubscribe: p,
		getListeners: () => r
	};
	return m;
}
var Af = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, jf = typeof navigator < "u" && navigator.product === "ReactNative", Mf = Af || jf ? y.useLayoutEffect : y.useEffect;
function Nf(e, t) {
	return e === t ? e !== 0 || t !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
function Pf(e, t) {
	if (Nf(e, t)) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r = 0; r < n.length; r++) if (!Object.prototype.hasOwnProperty.call(t, n[r]) || !Nf(e[n[r]], t[n[r]])) return !1;
	return !0;
}
var Ff = /* @__PURE__ */ Symbol.for("react-redux-context"), If = typeof globalThis < "u" ? globalThis : {};
function Lf() {
	if (!y.createContext) return {};
	let e = If[Ff] ??= /* @__PURE__ */ new Map(), t = e.get(y.createContext);
	return t || (t = y.createContext(null), e.set(y.createContext, t)), t;
}
var Rf = /* @__PURE__ */ Lf();
function zf(e) {
	let { children: t, context: n, serverState: r, store: i } = e, a = y.useMemo(() => {
		let e = kf(i);
		return {
			store: i,
			subscription: e,
			getServerState: r ? () => r : void 0
		};
	}, [i, r]), o = y.useMemo(() => i.getState(), [i]);
	Mf(() => {
		let { subscription: e } = a;
		return e.onStateChange = e.notifyNestedSubs, e.trySubscribe(), o !== i.getState() && e.notifyNestedSubs(), () => {
			e.tryUnsubscribe(), e.onStateChange = void 0;
		};
	}, [a, o]);
	let s = n || Rf;
	return /* @__PURE__ */ y.createElement(s.Provider, { value: a }, t);
}
var Bf = zf, Vf = /* @__PURE__ */ new Set([
	"axisLine",
	"tickLine",
	"activeBar",
	"activeDot",
	"activeLabel",
	"activeShape",
	"allowEscapeViewBox",
	"background",
	"cursor",
	"dot",
	"label",
	"line",
	"margin",
	"padding",
	"position",
	"shape",
	"style",
	"tick",
	"wrapperStyle",
	"radius",
	"throttledEvents"
]);
function Hf(e, t) {
	return e == null && t == null ? !0 : typeof e == "number" && typeof t == "number" ? e === t || e !== e && t !== t : e === t;
}
function Z(e, t) {
	for (var n of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])) if (Vf.has(n)) {
		if (e[n] == null && t[n] == null) continue;
		if (!Pf(e[n], t[n])) return !1;
	} else if (!Hf(e[n], t[n])) return !1;
	return !0;
}
//#endregion
//#region node_modules/recharts/es6/component/DefaultTooltipContent.js
function Uf() {
	return Uf = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Uf.apply(null, arguments);
}
function Wf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Gf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Wf(Object(n), !0).forEach(function(t) {
			Kf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Kf(e, t, n) {
	return (t = qf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function qf(e) {
	var t = Jf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Jf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Yf(e, t) {
	return ep(e) || $f(e, t) || Zf(e, t) || Xf();
}
function Xf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Zf(e, t) {
	if (e) {
		if (typeof e == "string") return Qf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qf(e, t) : void 0;
	}
}
function Qf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function $f(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ep(e) {
	if (Array.isArray(e)) return e;
}
function tp(e) {
	return Array.isArray(e) && si(e[0]) && si(e[1]) ? e.join(" ~ ") : e;
}
var Q = {
	separator: " : ",
	contentStyle: {
		margin: 0,
		padding: 10,
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		whiteSpace: "nowrap"
	},
	itemStyle: {
		display: "block",
		paddingTop: 4,
		paddingBottom: 4,
		color: "#000"
	},
	labelStyle: {},
	accessibilityLayer: !1
};
function np(e, t) {
	return t == null ? e : ws(e, t);
}
var rp = (e) => {
	var t = e.separator, n = t === void 0 ? Q.separator : t, r = e.contentStyle, i = e.itemStyle, a = e.labelStyle, o = a === void 0 ? Q.labelStyle : a, s = e.payload, c = e.formatter, l = e.itemSorter, u = e.wrapperClassName, d = e.labelClassName, f = e.label, p = e.labelFormatter, m = e.accessibilityLayer, h = m === void 0 ? Q.accessibilityLayer : m, g = () => {
		if (s && s.length) {
			var e = {
				padding: 0,
				margin: 0
			}, t = np(s, l).map((e, t) => {
				if (!e || e.type === "none") return null;
				var r = e.formatter || c || tp, a = e.value, o = e.name, l = a, u = o;
				if (r) {
					var d = r(a, o, e, t, s);
					if (Array.isArray(d)) {
						var f = Yf(d, 2);
						l = f[0], u = f[1];
					} else if (d != null) l = d;
					else return null;
				}
				var p = Gf(Gf({}, Q.itemStyle), {}, { color: e.color || Q.itemStyle.color }, i);
				return /*#__PURE__*/ y.createElement("li", {
					className: "recharts-tooltip-item",
					key: `tooltip-item-${t}`,
					style: p
				}, si(u) ? /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-name" }, u) : null, si(u) ? /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-separator" }, n) : null, /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-value" }, l), /*#__PURE__*/ y.createElement("span", { className: "recharts-tooltip-item-unit" }, e.unit || ""));
			});
			return /*#__PURE__*/ y.createElement("ul", {
				className: "recharts-tooltip-item-list",
				style: e
			}, t);
		}
		return null;
	}, _ = Gf(Gf({}, Q.contentStyle), r), v = Gf({ margin: 0 }, o), b = !mi(f), x = b ? f : "", S = Tr("recharts-default-tooltip", u), C = Tr("recharts-tooltip-label", d);
	b && p && s != null && (x = p(f, s));
	var w = h ? {
		role: "status",
		"aria-live": "assertive"
	} : {};
	return /*#__PURE__*/ y.createElement("div", Uf({
		className: S,
		style: _
	}, w), /*#__PURE__*/ y.createElement("p", {
		className: C,
		style: v
	}, /*#__PURE__*/ y.isValidElement(x) ? x : `${x}`), g());
}, ip = "recharts-tooltip-wrapper", ap = { visibility: "hidden" };
function op(e) {
	var t = e.coordinate, n = e.translateX, r = e.translateY;
	return Tr(ip, {
		[`${ip}-right`]: B(n) && t && B(t.x) && n >= t.x,
		[`${ip}-left`]: B(n) && t && B(t.x) && n < t.x,
		[`${ip}-bottom`]: B(r) && t && B(t.y) && r >= t.y,
		[`${ip}-top`]: B(r) && t && B(t.y) && r < t.y
	});
}
function sp(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.key, i = e.offset, a = e.position, o = e.reverseDirection, s = e.tooltipDimension, c = e.viewBox, l = e.viewBoxDimension;
	if (a && B(a[r])) return a[r];
	var u = n[r] - s - (i > 0 ? i : 0), d = n[r] + i;
	if (t[r]) return o[r] ? u : d;
	var f = c[r];
	return f == null ? 0 : o[r] ? Math.max(u < f ? d : u, f) : l == null ? 0 : d + s > f + l ? Math.max(u, f) : Math.max(d, f);
}
function cp(e) {
	var t = e.translateX, n = e.translateY;
	return { transform: e.useTranslate3d ? `translate3d(${t}px, ${n}px, 0)` : `translate(${t}px, ${n}px)` };
}
function lp(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.offsetTop, i = e.offsetLeft, a = e.position, o = e.reverseDirection, s = e.tooltipBox, c = e.useTranslate3d, l = e.viewBox, u, d, f;
	return s && s.height > 0 && s.width > 0 && n ? (d = sp({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "x",
		offset: i,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.width,
		viewBox: l,
		viewBoxDimension: l.width
	}), f = sp({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "y",
		offset: r,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.height,
		viewBox: l,
		viewBoxDimension: l.height
	}), u = cp({
		translateX: d,
		translateY: f,
		useTranslate3d: c
	})) : u = ap, {
		cssProperties: u,
		cssClasses: op({
			translateX: d,
			translateY: f,
			coordinate: n
		})
	};
}
var up = {
	devToolsEnabled: !0,
	isSsr: !(typeof window < "u" && window.document && window.document.createElement && window.setTimeout)
};
//#endregion
//#region node_modules/recharts/es6/util/usePrefersReducedMotion.js
function dp(e, t) {
	return gp(e) || hp(e, t) || pp(e, t) || fp();
}
function fp() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function pp(e, t) {
	if (e) {
		if (typeof e == "string") return mp(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? mp(e, t) : void 0;
	}
}
function mp(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function hp(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function gp(e) {
	if (Array.isArray(e)) return e;
}
function _p() {
	var e = dp((0, y.useState)(() => up.isSsr || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches), 2), t = e[0], n = e[1];
	return (0, y.useEffect)(() => {
		if (window.matchMedia) {
			var e = window.matchMedia("(prefers-reduced-motion: reduce)"), t = () => {
				n(e.matches);
			};
			return e.addEventListener("change", t), () => {
				e.removeEventListener("change", t);
			};
		}
	}, []), t;
}
//#endregion
//#region node_modules/recharts/es6/component/TooltipBoundingBox.js
function vp(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yp(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vp(Object(n), !0).forEach(function(t) {
			bp(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vp(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bp(e, t, n) {
	return (t = xp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xp(e) {
	var t = Sp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Sp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Cp(e, t) {
	return Op(e) || Dp(e, t) || Tp(e, t) || wp();
}
function wp() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Tp(e, t) {
	if (e) {
		if (typeof e == "string") return Ep(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ep(e, t) : void 0;
	}
}
function Ep(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Dp(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Op(e) {
	if (Array.isArray(e)) return e;
}
function kp(e) {
	if (!(e.prefersReducedMotion && e.isAnimationActive === "auto") && e.isAnimationActive && e.active) {
		var t = typeof e.animationEasing == "string" ? e.animationEasing : "ease";
		return `transform ${e.animationDuration}ms ${t}`;
	}
}
function Ap(e) {
	var t = _p(), n = Cp(y.useState(() => ({
		dismissed: !1,
		dismissedAtCoordinate: {
			x: 0,
			y: 0
		}
	})), 2), r = n[0], i = n[1];
	y.useEffect(() => {
		var t = (t) => {
			t.key === "Escape" && i({
				dismissed: !0,
				dismissedAtCoordinate: {
					x: e.coordinate?.x ?? 0,
					y: e.coordinate?.y ?? 0
				}
			});
		};
		return document.addEventListener("keydown", t), () => {
			document.removeEventListener("keydown", t);
		};
	}, [e.coordinate?.x, e.coordinate?.y]), r.dismissed && ((e.coordinate?.x ?? 0) !== r.dismissedAtCoordinate.x || (e.coordinate?.y ?? 0) !== r.dismissedAtCoordinate.y) && i(yp(yp({}, r), {}, { dismissed: !1 }));
	var a = lp({
		allowEscapeViewBox: e.allowEscapeViewBox,
		coordinate: e.coordinate,
		offsetLeft: typeof e.offset == "number" ? e.offset : e.offset.x,
		offsetTop: typeof e.offset == "number" ? e.offset : e.offset.y,
		position: e.position,
		reverseDirection: e.reverseDirection,
		tooltipBox: e.lastBoundingBox,
		useTranslate3d: e.useTranslate3d,
		viewBox: e.viewBox
	}), o = a.cssClasses, s = a.cssProperties, c = yp(yp({}, e.hasPortalFromProps ? {} : yp(yp({ transition: kp({
		prefersReducedMotion: t,
		isAnimationActive: e.isAnimationActive,
		active: e.active,
		animationDuration: e.animationDuration,
		animationEasing: e.animationEasing
	}) }, s), {}, {
		pointerEvents: "none",
		position: "absolute",
		top: 0,
		left: 0
	})), {}, { visibility: !r.dismissed && e.active && e.hasPayload ? "visible" : "hidden" }, e.wrapperStyle);
	return /*#__PURE__*/ y.createElement("div", {
		xmlns: "http://www.w3.org/1999/xhtml",
		tabIndex: -1,
		className: o,
		style: c,
		ref: e.innerRef
	}, e.children);
}
var jp = /*#__PURE__*/ y.memo(Ap), Mp = () => U((e) => e.rootProps.accessibilityLayer) ?? !0;
//#endregion
//#region node_modules/recharts/es6/shape/Curve.js
function Np() {
	return Np = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Np.apply(null, arguments);
}
function Pp(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Fp(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Pp(Object(n), !0).forEach(function(t) {
			Ip(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pp(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ip(e, t, n) {
	return (t = Lp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Lp(e) {
	var t = Rp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Rp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var zp = {
	curveBasisClosed: Qi,
	curveBasisOpen: ea,
	curveBasis: Xi,
	curveBumpX: Gi,
	curveBumpY: Ki,
	curveLinearClosed: na,
	curveLinear: zi,
	curveMonotoneX: la,
	curveMonotoneY: ua,
	curveNatural: pa,
	curveStep: ha,
	curveStepAfter: _a,
	curveStepBefore: ga
}, Bp = (e) => q(e.x) && q(e.y), Vp = (e) => e.base != null && Bp(e.base) && Bp(e), Hp = (e) => e.x, Up = (e) => e.y, Wp = (e, t) => {
	if (typeof e == "function") return e;
	var n = `curve${hi(e)}`;
	if ((n === "curveMonotone" || n === "curveBump") && t) {
		var r = zp[`${n}${t === "vertical" ? "Y" : "X"}`];
		if (r) return r;
	}
	return zp[n] || zi;
}, Gp = {
	connectNulls: !1,
	type: "linear"
}, Kp = (e) => {
	var t = e.type, n = t === void 0 ? Gp.type : t, r = e.points, i = r === void 0 ? [] : r, a = e.baseLine, o = e.layout, s = e.connectNulls, c = s === void 0 ? Gp.connectNulls : s, l = Wp(n, o), u = c ? i.filter(Bp) : i;
	if (Array.isArray(a)) {
		var d, f = i.map((e, t) => Fp(Fp({}, e), {}, { base: a[t] }));
		return d = o === "vertical" ? Ui().y(Up).x1(Hp).x0((e) => e.base.x) : Ui().x(Hp).y1(Up).y0((e) => e.base.y), d.defined(Vp).curve(l)(c ? f.filter(Vp) : f);
	}
	return (o === "vertical" && B(a) ? Ui().y(Up).x1(Hp).x0(a) : B(a) ? Ui().x(Hp).y1(Up).y0(a) : Hi().x(Hp).y(Up)).defined(Bp).curve(l)(u);
}, qp = (e) => {
	var t = e.className, n = e.points, r = e.path, i = e.pathRef, a = X();
	if ((!n || !n.length) && !r) return null;
	var o = {
		type: e.type,
		points: e.points,
		baseLine: e.baseLine,
		layout: e.layout || a,
		connectNulls: e.connectNulls
	}, s = n && n.length ? Kp(o) : r;
	return /*#__PURE__*/ y.createElement("path", Np({}, jr(e), Da(e), {
		className: Tr("recharts-curve", t),
		d: s === null ? void 0 : s,
		ref: i
	}));
}, Jp = [
	"x",
	"y",
	"top",
	"left",
	"width",
	"height",
	"className"
];
function Yp() {
	return Yp = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Yp.apply(null, arguments);
}
function Xp(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Zp(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Xp(Object(n), !0).forEach(function(t) {
			Qp(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Xp(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Qp(e, t, n) {
	return (t = $p(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function $p(e) {
	var t = em(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function em(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function tm(e, t) {
	if (e == null) return {};
	var n, r, i = nm(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function nm(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var rm = (e, t, n, r, i, a) => `M${e},${i}v${r}M${a},${t}h${n}`, im = (e) => {
	var t = e.x, n = t === void 0 ? 0 : t, r = e.y, i = r === void 0 ? 0 : r, a = e.top, o = a === void 0 ? 0 : a, s = e.left, c = s === void 0 ? 0 : s, l = e.width, u = l === void 0 ? 0 : l, d = e.height, f = d === void 0 ? 0 : d, p = e.className, m = tm(e, Jp), h = Zp({
		x: n,
		y: i,
		top: o,
		left: c,
		width: u,
		height: f
	}, m);
	return !B(n) || !B(i) || !B(u) || !B(f) || !B(o) || !B(c) ? null : /*#__PURE__*/ y.createElement("path", Yp({}, Nr(h), {
		className: Tr("recharts-cross", p),
		d: rm(n, i, u, f, o, c)
	}));
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getCursorRectangle.js
function am(e, t, n, r) {
	var i = r / 2;
	return {
		stroke: "none",
		fill: "#ccc",
		x: e === "horizontal" ? t.x - i : n.left + .5,
		y: e === "horizontal" ? n.top + .5 : t.y - i,
		width: e === "horizontal" ? r : n.width - 1,
		height: e === "horizontal" ? n.height - 1 : r
	};
}
var om = (e, t) => [
	0,
	3 * e,
	3 * t - 6 * e,
	3 * e - 3 * t + 1
], sm = (e, t) => e.map((e, n) => e * t ** n).reduce((e, t) => e + t), cm = (e, t) => (n) => sm(om(e, t), n), lm = (e, t) => (n) => sm([...om(e, t).map((e, t) => e * t).slice(1), 0], n), um = (e) => {
	var t, n = e.split("(");
	if (n.length !== 2 || n[0] !== "cubic-bezier") return null;
	var r = (t = n[1]) == null || (t = t.split(")")[0]) == null ? void 0 : t.split(",");
	if (r == null || r.length !== 4) return null;
	var i = r.map((e) => parseFloat(e));
	return [
		i[0],
		i[1],
		i[2],
		i[3]
	];
}, dm = function() {
	var e = [...arguments];
	if (e.length === 1) switch (e[0]) {
		case "linear": return [
			0,
			0,
			1,
			1
		];
		case "ease": return [
			.25,
			.1,
			.25,
			1
		];
		case "ease-in": return [
			.42,
			0,
			1,
			1
		];
		case "ease-out": return [
			.42,
			0,
			.58,
			1
		];
		case "ease-in-out": return [
			0,
			0,
			.58,
			1
		];
		default:
			var t = um(e[0]);
			if (t) return t;
	}
	return e.length === 4 ? e : [
		0,
		0,
		1,
		1
	];
}, fm = (e, t, n, r) => {
	var i = cm(e, n), a = cm(t, r), o = lm(e, n), s = (e) => e > 1 ? 1 : e < 0 ? 0 : e, c = (e) => {
		for (var t = e > 1 ? 1 : e, n = t, r = 0; r < 8; ++r) {
			var c = i(n) - t, l = o(n);
			if (Math.abs(c - t) < 1e-4 || l < 1e-4) return a(n);
			n = s(n - c / l);
		}
		return a(n);
	};
	return c.isStepper = !1, c;
}, pm = function() {
	return fm(...dm(...arguments));
}, mm = function() {
	for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = e.stiff, n = t === void 0 ? 100 : t, r = e.damping, i = r === void 0 ? 8 : r, a = e.dt, o = a === void 0 ? 16.67 : a, s = 1, c = [0], l = 0, u = 0, d = 1e4, f = 0; f < d;) {
		var p = -(l - s) * n, m = u * i;
		if (u += (p - m) * o / 1e3, l += u * o / 1e3, c.push(l), Math.abs(l - s) < 1e-4 && Math.abs(u) < 1e-4) break;
		f++;
	}
	c[c.length - 1] = s;
	var h = c.length - 1;
	return (e) => {
		if (e <= 0) return 0;
		if (e >= 1) return s;
		var t = e * h, n = Math.floor(t), r = t - n;
		return (c[n] ?? 0) + ((c[n + 1] ?? 0) - (c[n] ?? 0)) * r;
	};
}, hm = (e) => {
	if (typeof e == "string") switch (e) {
		case "ease":
		case "ease-in-out":
		case "ease-out":
		case "ease-in":
		case "linear": return pm(e);
		case "spring": return mm();
		default: if (e.split("(")[0] === "cubic-bezier") return pm(e);
	}
	return typeof e == "function" ? e : null;
}, gm = /*#__PURE__*/ (0, y.createContext)((e, t, n) => {
	var r, i = (a) => {
		var o = t.tick(a);
		if (t.getState() === "active") {
			if (n(t.getInterpolated()), t.getProgress() === 1) {
				t.complete(), r = void 0;
				return;
			}
			r = e.setTimeout(i, o);
		} else r = e.setTimeout(i, o);
	};
	return r = e.setTimeout(i, 0), () => r?.();
});
gm.Provider;
function _m(e) {
	var t = (0, y.useContext)(gm);
	return (0, y.useMemo)(() => e ?? t, [e, t]);
}
//#endregion
//#region node_modules/recharts/es6/animation/AnimationHandle.js
function vm(e, t, n) {
	return (t = ym(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ym(e) {
	var t = bm(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function bm(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var xm = "init", Sm = "pending", Cm = "active", wm = "completed";
function Tm(e) {
	return Math.max(0, e);
}
var Em = class {
	getAnimationStartedTime() {
		return this.animationStartedTime;
	}
	getBeginStartedTime() {
		return this.beginStartedTime;
	}
	constructor(e) {
		var t;
		vm(this, "state", xm), this.animationId = e.animationId, this.onAnimationEnd = e.onAnimationEnd, this.animationDuration = Tm(e.animationDuration), this.animationBegin = Tm(e.animationBegin), this.progress = 0, this.from = e.from, this.to = e.to, this.easing = e.easing, (t = e.onAnimationStart) == null || t.call(e);
	}
	getState() {
		return this.state;
	}
	getEasing() {
		return this.easing;
	}
	getAnimationDuration() {
		return this.animationDuration;
	}
	tick(e) {
		if (this.getState() === xm) return this.state = Sm, this.beginStartedTime = e, this.animationBegin;
		if (this.getState() === Sm) {
			if (this.beginStartedTime == null) throw Error();
			var t = e - this.beginStartedTime;
			return t >= this.animationBegin ? (this.state = Cm, this.animationStartedTime = e, this.nextAnimationUpdate(0)) : Tm(this.animationBegin - t);
		}
		if (this.getState() === Cm) {
			if (this.animationStartedTime == null) throw Error();
			var n = e - this.animationStartedTime;
			return this.setProgress(n / this.animationDuration), this.nextAnimationUpdate(n);
		}
		return 0;
	}
	setProgress(e) {
		this.progress = Math.min(1, Math.max(0, e));
	}
	getProgress() {
		return this.progress;
	}
	complete() {
		if (this.progress = 1, this.state === "active") {
			var e;
			(e = this.onAnimationEnd) == null || e.call(this);
		}
		this.state = wm;
	}
	getFrom() {
		return this.from;
	}
	getTo() {
		return this.to;
	}
	getAnimationId() {
		return this.animationId;
	}
	getAnimationBegin() {
		return this.animationBegin;
	}
}, Dm = class extends Em {
	nextAnimationUpdate() {
		return 0;
	}
	getInterpolated() {
		return this.easing(fi(this.getFrom(), this.getTo(), this.getProgress()));
	}
}, Om = class {
	setTimeout(e) {
		var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n = performance.now(), r = null, i = (a) => {
			a - n >= t ? e(a) : r = requestAnimationFrame(i);
		};
		return r = requestAnimationFrame(i), () => {
			r != null && cancelAnimationFrame(r);
		};
	}
};
//#endregion
//#region node_modules/recharts/es6/animation/JavascriptAnimate.js
function km(e, t) {
	return Pm(e) || Nm(e, t) || jm(e, t) || Am();
}
function Am() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function jm(e, t) {
	if (e) {
		if (typeof e == "string") return Mm(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mm(e, t) : void 0;
	}
}
function Mm(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Nm(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Pm(e) {
	if (Array.isArray(e)) return e;
}
var Fm = {
	begin: 0,
	duration: 1e3,
	easing: "ease",
	isActive: !0,
	canBegin: !0,
	onAnimationEnd: () => {},
	onAnimationStart: () => {}
}, Im = 0, Lm = 1;
function Rm(e) {
	var t = Fa(e, Fm), n = t.animationId, r = t.isActive, i = t.canBegin, a = t.duration, o = t.easing, s = t.begin, c = t.onAnimationEnd, l = t.onAnimationStart, u = t.children, d = _p(), f = r === "auto" ? !up.isSsr && !d : r, p = _m(t.animationController), m = km((0, y.useState)(f ? Im : Lm), 2), h = m[0], g = m[1];
	return (0, y.useEffect)(() => {
		f || g(Lm);
	}, [f]), (0, y.useEffect)(() => {
		var e = hm(o);
		return !f || !i || e == null ? _i : p(new Om(), new Dm({
			animationId: n,
			easing: e,
			animationDuration: a,
			animationBegin: s,
			onAnimationStart: l,
			onAnimationEnd: c,
			from: Im,
			to: Lm
		}), g);
	}, [
		p,
		n,
		f,
		i,
		a,
		o,
		s,
		l,
		c
	]), u(Number(h));
}
//#endregion
//#region node_modules/recharts/es6/util/useAnimationId.js
function zm(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-", n = (0, y.useRef)(li(t)), r = (0, y.useRef)(e);
	return r.current !== e && (n.current = li(t), r.current = e), n.current;
}
//#endregion
//#region node_modules/recharts/es6/animation/util.js
var Bm = (e) => e.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`), Vm = (e, t, n) => e.map((e) => `${Bm(e)} ${t}ms ${n}`).join(","), Hm = ["radius"], Um = ["radius"], Wm, Gm, Km, qm, Jm, Ym, Xm, Zm, Qm, $m;
function eh(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function th(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? eh(Object(n), !0).forEach(function(t) {
			nh(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : eh(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function nh(e, t, n) {
	return (t = rh(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function rh(e) {
	var t = ih(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ih(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ah() {
	return ah = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, ah.apply(null, arguments);
}
function oh(e, t) {
	if (e == null) return {};
	var n, r, i = sh(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function sh(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function ch(e, t) {
	return ph(e) || fh(e, t) || uh(e, t) || lh();
}
function lh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function uh(e, t) {
	if (e) {
		if (typeof e == "string") return dh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dh(e, t) : void 0;
	}
}
function dh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function fh(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ph(e) {
	if (Array.isArray(e)) return e;
}
function mh(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var hh = (e, t, n, r, i) => {
	var a = ni(n), o = ni(r), s = Math.min(Math.abs(a) / 2, Math.abs(o) / 2), c = o >= 0 ? 1 : -1, l = a >= 0 ? 1 : -1, u = +(o >= 0 && a >= 0 || o < 0 && a < 0), d;
	if (s > 0 && Array.isArray(i)) {
		for (var f = [
			0,
			0,
			0,
			0
		], p = 0, m = 4; p < m; p++) {
			var h = i[p] ?? 0;
			f[p] = h > s ? s : h;
		}
		d = ri(Wm ||= mh([
			"M",
			",",
			""
		]), e, t + c * f[0]), f[0] > 0 && (d += ri(Gm ||= mh([
			"A ",
			",",
			",0,0,",
			",",
			",",
			""
		]), f[0], f[0], u, e + l * f[0], t)), d += ri(Km ||= mh([
			"L ",
			",",
			""
		]), e + n - l * f[1], t), f[1] > 0 && (d += ri(qm ||= mh([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[1], f[1], u, e + n, t + c * f[1])), d += ri(Jm ||= mh([
			"L ",
			",",
			""
		]), e + n, t + r - c * f[2]), f[2] > 0 && (d += ri(Ym ||= mh([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[2], f[2], u, e + n - l * f[2], t + r)), d += ri(Xm ||= mh([
			"L ",
			",",
			""
		]), e + l * f[3], t + r), f[3] > 0 && (d += ri(Zm ||= mh([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[3], f[3], u, e, t + r - c * f[3])), d += "Z";
	} else if (s > 0 && i === +i && i > 0) {
		var g = Math.min(s, i);
		d = ri(Qm ||= mh(/* @__PURE__ */ "M .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,. Z".split(".")), e, t + c * g, g, g, u, e + l * g, t, e + n - l * g, t, g, g, u, e + n, t + c * g, e + n, t + r - c * g, g, g, u, e + n - l * g, t + r, e + l * g, t + r, g, g, u, e, t + r - c * g);
	} else d = ri($m ||= mh([
		"M ",
		",",
		" h ",
		" v ",
		" h ",
		" Z"
	]), e, t, n, r, -n);
	return d;
}, gh = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	radius: 0,
	isAnimationActive: !1,
	isUpdateAnimationActive: !1,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease"
}, _h = (e) => {
	var t = Fa(e, gh), n = (0, y.useRef)(null), r = ch((0, y.useState)(-1), 2), i = r[0], a = r[1];
	(0, y.useEffect)(() => {
		if (n.current && n.current.getTotalLength) try {
			var e = n.current.getTotalLength();
			e && a(e);
		} catch {}
	}, []);
	var o = t.x, s = t.y, c = t.width, l = t.height, u = t.radius, d = t.className, f = t.animationEasing, p = t.animationDuration, m = t.animationBegin, h = t.isAnimationActive, g = t.isUpdateAnimationActive, _ = (0, y.useRef)(c), v = (0, y.useRef)(l), b = (0, y.useRef)(o), x = (0, y.useRef)(s), S = zm((0, y.useMemo)(() => ({
		x: o,
		y: s,
		width: c,
		height: l,
		radius: u
	}), [
		o,
		s,
		c,
		l,
		u
	]), "rectangle-");
	if (o !== +o || s !== +s || c !== +c || l !== +l || c === 0 || l === 0) return null;
	var C = Tr("recharts-rectangle", d);
	if (!g) {
		var w = Nr(t);
		w.radius;
		var T = oh(w, Hm);
		return /*#__PURE__*/ y.createElement("path", ah({}, T, {
			x: ni(o),
			y: ni(s),
			width: ni(c),
			height: ni(l),
			radius: typeof u == "number" ? u : void 0,
			className: C,
			d: hh(o, s, c, l, u)
		}));
	}
	var E = _.current, D = v.current, O = b.current, k = x.current, A = `0px ${i === -1 ? 1 : i}px`, j = `${i}px ${i}px`, M = Vm(["strokeDasharray"], p, typeof f == "string" ? f : gh.animationEasing);
	return /*#__PURE__*/ y.createElement(Rm, {
		animationId: S,
		key: S,
		canBegin: i > 0,
		duration: p,
		easing: f,
		isActive: g,
		begin: m
	}, (e) => {
		var r = fi(E, c, e), i = fi(D, l, e), a = fi(O, o, e), d = fi(k, s, e);
		n.current && (_.current = r, v.current = i, b.current = a, x.current = d);
		var f = h ? e > 0 ? {
			transition: M,
			strokeDasharray: j
		} : { strokeDasharray: A } : { strokeDasharray: j }, p = Nr(t);
		p.radius;
		var m = oh(p, Um);
		return /*#__PURE__*/ y.createElement("path", ah({}, m, {
			radius: typeof u == "number" ? u : void 0,
			className: C,
			d: hh(a, d, r, i, u),
			ref: n,
			style: th(th({}, f), t.style)
		}));
	});
};
//#endregion
//#region node_modules/recharts/es6/util/PolarUtils.js
function vh(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yh(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vh(Object(n), !0).forEach(function(t) {
			bh(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vh(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bh(e, t, n) {
	return (t = xh(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xh(e) {
	var t = Sh(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Sh(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Ch = Math.PI / 180, wh = (e) => e * 180 / Math.PI, Th = (e, t, n, r) => ({
	x: e + Math.cos(-Ch * r) * n,
	y: t + Math.sin(-Ch * r) * n
}), Eh = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: 0,
		height: 0,
		brushBottom: 0
	};
	return Math.min(Math.abs(e - (n.left || 0) - (n.right || 0)), Math.abs(t - (n.top || 0) - (n.bottom || 0))) / 2;
}, Dh = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return Math.sqrt((n - i) ** 2 + (r - a) ** 2);
}, Oh = (e, t) => {
	var n = e.x, r = e.y, i = t.cx, a = t.cy, o = Dh({
		x: n,
		y: r
	}, {
		x: i,
		y: a
	});
	if (o <= 0) return {
		radius: o,
		angle: 0
	};
	var s = (n - i) / o, c = Math.acos(s);
	return r > a && (c = 2 * Math.PI - c), {
		radius: o,
		angle: wh(c),
		angleInRadian: c
	};
}, kh = (e) => {
	var t = e.startAngle, n = e.endAngle, r = Math.floor(t / 360), i = Math.floor(n / 360), a = Math.min(r, i);
	return {
		startAngle: t - a * 360,
		endAngle: n - a * 360
	};
}, Ah = (e, t) => {
	var n = t.startAngle, r = t.endAngle, i = Math.floor(n / 360), a = Math.floor(r / 360);
	return e + Math.min(i, a) * 360;
}, jh = (e, t) => {
	var n = e.relativeX, r = e.relativeY, i = Oh({
		x: n,
		y: r
	}, t), a = i.radius, o = i.angle, s = t.innerRadius, c = t.outerRadius;
	if (a < s || a > c || a === 0) return null;
	var l = kh(t), u = l.startAngle, d = l.endAngle, f = o, p;
	if (u <= d) {
		for (; f > d;) f -= 360;
		for (; f < u;) f += 360;
		p = f >= u && f <= d;
	} else {
		for (; f > u;) f -= 360;
		for (; f < d;) f += 360;
		p = f >= d && f <= u;
	}
	return p ? yh(yh({}, t), {}, {
		radius: a,
		angle: Ah(f, t)
	}) : null;
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getRadialCursorPoints.js
function Mh(e) {
	var t = e.cx, n = e.cy, r = e.radius, i = e.startAngle, a = e.endAngle;
	return {
		points: [Th(t, n, r, i), Th(t, n, r, a)],
		cx: t,
		cy: n,
		radius: r,
		startAngle: i,
		endAngle: a
	};
}
//#endregion
//#region node_modules/recharts/es6/shape/Sector.js
var Nh, Ph, Fh, Ih, Lh, Rh, zh;
function Bh() {
	return Bh = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Bh.apply(null, arguments);
}
function Vh(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Hh = (e, t) => ii(t - e) * Math.min(Math.abs(t - e), 359.999), Uh = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.angle, a = e.sign, o = e.isExternal, s = e.cornerRadius, c = e.cornerIsExternal, l = s * (o ? 1 : -1) + r, u = Math.asin(s / l) / Ch, d = c ? i : i + a * u, f = Th(t, n, l, d), p = Th(t, n, r, d), m = c ? i - a * u : i;
	return {
		center: f,
		circleTangency: p,
		lineTangency: Th(t, n, l * Math.cos(u * Ch), m),
		theta: u
	};
}, Wh = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.startAngle, o = e.endAngle, s = Hh(a, o), c = a + s, l = Th(t, n, i, a), u = Th(t, n, i, c), d = ri(Nh ||= Vh([
		"M ",
		",",
		"\n    A ",
		",",
		",0,\n    ",
		",",
		",\n    ",
		",",
		"\n  "
	]), l.x, l.y, i, i, +(Math.abs(s) > 180), +(a > c), u.x, u.y);
	if (r > 0) {
		var f = Th(t, n, r, a), p = Th(t, n, r, c);
		d += ri(Ph ||= Vh([
			"L ",
			",",
			"\n            A ",
			",",
			",0,\n            ",
			",",
			",\n            ",
			",",
			" Z"
		]), p.x, p.y, r, r, +(Math.abs(s) > 180), +(a <= c), f.x, f.y);
	} else d += ri(Fh ||= Vh([
		"L ",
		",",
		" Z"
	]), t, n);
	return d;
}, Gh = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.cornerRadius, o = e.forceCornerRadius, s = e.cornerIsExternal, c = e.startAngle, l = e.endAngle, u = ii(l - c), d = Uh({
		cx: t,
		cy: n,
		radius: i,
		angle: c,
		sign: u,
		cornerRadius: a,
		cornerIsExternal: s
	}), f = d.circleTangency, p = d.lineTangency, m = d.theta, h = Uh({
		cx: t,
		cy: n,
		radius: i,
		angle: l,
		sign: -u,
		cornerRadius: a,
		cornerIsExternal: s
	}), g = h.circleTangency, _ = h.lineTangency, v = h.theta, y = s ? Math.abs(c - l) : Math.abs(c - l) - m - v;
	if (y < 0) return o ? ri(Ih ||= Vh([
		"M ",
		",",
		"\n        a",
		",",
		",0,0,1,",
		",0\n        a",
		",",
		",0,0,1,",
		",0\n      "
	]), p.x, p.y, a, a, a * 2, a, a, -a * 2) : Wh({
		cx: t,
		cy: n,
		innerRadius: r,
		outerRadius: i,
		startAngle: c,
		endAngle: l
	});
	var b = ri(Lh ||= Vh([
		"M ",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n    A",
		",",
		",0,",
		",",
		",",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n  "
	]), p.x, p.y, a, a, +(u < 0), f.x, f.y, i, i, +(y > 180), +(u < 0), g.x, g.y, a, a, +(u < 0), _.x, _.y);
	if (r > 0) {
		var x = Uh({
			cx: t,
			cy: n,
			radius: r,
			angle: c,
			sign: u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), S = x.circleTangency, C = x.lineTangency, w = x.theta, T = Uh({
			cx: t,
			cy: n,
			radius: r,
			angle: l,
			sign: -u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), E = T.circleTangency, D = T.lineTangency, O = T.theta, k = s ? Math.abs(c - l) : Math.abs(c - l) - w - O;
		if (k < 0 && a === 0) return `${b}L${t},${n}Z`;
		b += ri(Rh ||= Vh([
			"L",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"\n      A",
			",",
			",0,",
			",",
			",",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"Z"
		]), D.x, D.y, a, a, +(u < 0), E.x, E.y, r, r, +(k > 180), +(u > 0), S.x, S.y, a, a, +(u < 0), C.x, C.y);
	} else b += ri(zh ||= Vh([
		"L",
		",",
		"Z"
	]), t, n);
	return b;
}, Kh = {
	cx: 0,
	cy: 0,
	innerRadius: 0,
	outerRadius: 0,
	startAngle: 0,
	endAngle: 0,
	cornerRadius: 0,
	forceCornerRadius: !1,
	cornerIsExternal: !1
}, qh = (e) => {
	var t = Fa(e, Kh), n = t.cx, r = t.cy, i = t.innerRadius, a = t.outerRadius, o = t.cornerRadius, s = t.forceCornerRadius, c = t.cornerIsExternal, l = t.startAngle, u = t.endAngle, d = t.className;
	if (a < i || l === u) return null;
	var f = Tr("recharts-sector", d), p = a - i, m = ui(o, p, 0, !0), h = m > 0 && Math.abs(l - u) < 360 ? Gh({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		cornerRadius: Math.min(m, p / 2),
		forceCornerRadius: s,
		cornerIsExternal: c,
		startAngle: l,
		endAngle: u
	}) : Wh({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		startAngle: l,
		endAngle: u
	});
	return /*#__PURE__*/ y.createElement("path", Bh({}, Nr(t), {
		className: f,
		d: h
	}));
};
//#endregion
//#region node_modules/recharts/es6/util/cursor/getCursorPoints.js
function Jh(e, t, n) {
	if (e === "horizontal") return [{
		x: t.x,
		y: n.top
	}, {
		x: t.x,
		y: n.top + n.height
	}];
	if (e === "vertical") return [{
		x: n.left,
		y: t.y
	}, {
		x: n.left + n.width,
		y: t.y
	}];
	if (Ea(t)) {
		if (e === "centric") {
			var r = t.cx, i = t.cy, a = t.innerRadius, o = t.outerRadius, s = t.angle, c = Th(r, i, a, s), l = Th(r, i, o, s);
			return [{
				x: c.x,
				y: c.y
			}, {
				x: l.x,
				y: l.y
			}];
		}
		return Mh(t);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toNumber.mjs
function Yh(e) {
	return Yr(e) ? NaN : Number(e);
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/util/toFinite.mjs
function Xh(e) {
	return e ? (e = Yh(e), e === Infinity || e === -Infinity ? (e < 0 ? -1 : 1) * Number.MAX_VALUE : e === e ? e : 0) : e === 0 ? e : 0;
}
//#endregion
//#region node_modules/es-toolkit/dist/compat/math/range.mjs
function Zh(e, t, n) {
	n && typeof n != "number" && _s(e, t, n) && (t = n = void 0), e = Xh(e), t === void 0 ? (t = e, e = 0) : t = Xh(t), n = n === void 0 ? e < t ? 1 : -1 : Xh(n);
	let r = Math.max(Math.ceil((t - e) / (n || 1)), 0), i = Array(r);
	for (let t = 0; t < r; t++) i[t] = e, e += n;
	return i;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/dataSelectors.js
var Qh = (e) => e.chartData, $h = W([Qh], (e) => {
	var t = e.chartData == null ? 0 : e.chartData.length - 1;
	return {
		chartData: e.chartData,
		computedData: e.computedData,
		dataEndIndex: t,
		dataStartIndex: 0
	};
}), eg = (e, t, n, r) => r ? $h(e) : Qh(e), tg = W([eg], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
W([$h], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
var ng = W([Qh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
//#endregion
//#region node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
function rg(e, t) {
	return cg(e) || sg(e, t) || ag(e, t) || ig();
}
function ig() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ag(e, t) {
	if (e) {
		if (typeof e == "string") return og(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? og(e, t) : void 0;
	}
}
function og(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function sg(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function cg(e) {
	if (Array.isArray(e)) return e;
}
function lg(e) {
	if (Array.isArray(e) && e.length === 2) {
		var t = rg(e, 2), n = t[0], r = t[1];
		if (q(n) && q(r)) return !0;
	}
	return !1;
}
function ug(e, t, n) {
	return n ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function dg(e, t) {
	if (t && typeof e != "function" && Array.isArray(e) && e.length === 2) {
		var n = rg(e, 2), r = n[0], i = n[1], a, o;
		if (q(r)) a = r;
		else if (typeof r == "function") return;
		if (q(i)) o = i;
		else if (typeof i == "function") return;
		var s = [a, o];
		if (lg(s)) return s;
	}
}
function fg(e, t, n) {
	if (n || t != null) {
		if (typeof e == "function" && t != null) try {
			var r = e(t, n);
			if (lg(r)) return ug(r, t, n);
		} catch {}
		if (Array.isArray(e) && e.length === 2) {
			var i = rg(e, 2), a = i[0], o = i[1], s, c;
			if (a === "auto") t != null && (s = Math.min(...t));
			else if (B(a)) s = a;
			else if (typeof a == "function") try {
				t != null && (s = a(t?.[0]));
			} catch {}
			else if (typeof a == "string" && J.test(a)) {
				var l = J.exec(a);
				if (l == null || l[1] == null || t == null) s = void 0;
				else {
					var u = +l[1];
					s = t[0] - u;
				}
			} else s = t?.[0];
			if (o === "auto") t != null && (c = Math.max(...t));
			else if (B(o)) c = o;
			else if (typeof o == "function") try {
				t != null && (c = o(t?.[1]));
			} catch {}
			else if (typeof o == "string" && Y.test(o)) {
				var d = Y.exec(o);
				if (d == null || d[1] == null || t == null) c = void 0;
				else {
					var f = +d[1];
					c = t[1] + f;
				}
			} else c = t?.[1];
			var p = [s, c];
			if (lg(p)) return t == null ? p : ug(p, t, n);
		}
	}
}
//#endregion
//#region node_modules/recharts/es6/util/scale/util/arithmetic.js
var $ = /* @__PURE__ */ u((/* @__PURE__ */ s(((e, t) => {
	(function(e) {
		var n = 1e9, r = {
			precision: 20,
			rounding: 4,
			toExpNeg: -7,
			toExpPos: 21,
			LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
		}, i = !0, a = "[DecimalError] ", o = a + "Invalid argument: ", s = a + "Exponent out of range: ", c = Math.floor, l = Math.pow, u = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, d, f = 1e7, p = 7, m = 9007199254740991, h = c(m / p), g = {};
		g.absoluteValue = g.abs = function() {
			var e = new this.constructor(this);
			return e.s &&= 1, e;
		}, g.comparedTo = g.cmp = function(e) {
			var t, n, r, i, a = this;
			if (e = new a.constructor(e), a.s !== e.s) return a.s || -e.s;
			if (a.e !== e.e) return a.e > e.e ^ a.s < 0 ? 1 : -1;
			for (r = a.d.length, i = e.d.length, t = 0, n = r < i ? r : i; t < n; ++t) if (a.d[t] !== e.d[t]) return a.d[t] > e.d[t] ^ a.s < 0 ? 1 : -1;
			return r === i ? 0 : r > i ^ a.s < 0 ? 1 : -1;
		}, g.decimalPlaces = g.dp = function() {
			var e = this, t = e.d.length - 1, n = (t - e.e) * p;
			if (t = e.d[t], t) for (; t % 10 == 0; t /= 10) n--;
			return n < 0 ? 0 : n;
		}, g.dividedBy = g.div = function(e) {
			return b(this, new this.constructor(e));
		}, g.dividedToIntegerBy = g.idiv = function(e) {
			var t = this, n = t.constructor;
			return D(b(t, new n(e), 0, 1), n.precision);
		}, g.equals = g.eq = function(e) {
			return !this.cmp(e);
		}, g.exponent = function() {
			return S(this);
		}, g.greaterThan = g.gt = function(e) {
			return this.cmp(e) > 0;
		}, g.greaterThanOrEqualTo = g.gte = function(e) {
			return this.cmp(e) >= 0;
		}, g.isInteger = g.isint = function() {
			return this.e > this.d.length - 2;
		}, g.isNegative = g.isneg = function() {
			return this.s < 0;
		}, g.isPositive = g.ispos = function() {
			return this.s > 0;
		}, g.isZero = function() {
			return this.s === 0;
		}, g.lessThan = g.lt = function(e) {
			return this.cmp(e) < 0;
		}, g.lessThanOrEqualTo = g.lte = function(e) {
			return this.cmp(e) < 1;
		}, g.logarithm = g.log = function(e) {
			var t, n = this, r = n.constructor, o = r.precision, s = o + 5;
			if (e === void 0) e = new r(10);
			else if (e = new r(e), e.s < 1 || e.eq(d)) throw Error(a + "NaN");
			if (n.s < 1) throw Error(a + (n.s ? "NaN" : "-Infinity"));
			return n.eq(d) ? new r(0) : (i = !1, t = b(T(n, s), T(e, s), s), i = !0, D(t, o));
		}, g.minus = g.sub = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? O(t, e) : _(t, (e.s = -e.s, e));
		}, g.modulo = g.mod = function(e) {
			var t, n = this, r = n.constructor, o = r.precision;
			if (e = new r(e), !e.s) throw Error(a + "NaN");
			return n.s ? (i = !1, t = b(n, e, 0, 1).times(e), i = !0, n.minus(t)) : D(new r(n), o);
		}, g.naturalExponential = g.exp = function() {
			return x(this);
		}, g.naturalLogarithm = g.ln = function() {
			return T(this);
		}, g.negated = g.neg = function() {
			var e = new this.constructor(this);
			return e.s = -e.s || 0, e;
		}, g.plus = g.add = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? _(t, e) : O(t, (e.s = -e.s, e));
		}, g.precision = g.sd = function(e) {
			var t, n, r, i = this;
			if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(o + e);
			if (t = S(i) + 1, r = i.d.length - 1, n = r * p + 1, r = i.d[r], r) {
				for (; r % 10 == 0; r /= 10) n--;
				for (r = i.d[0]; r >= 10; r /= 10) n++;
			}
			return e && t > n ? t : n;
		}, g.squareRoot = g.sqrt = function() {
			var e, t, n, r, o, s, l, u = this, d = u.constructor;
			if (u.s < 1) {
				if (!u.s) return new d(0);
				throw Error(a + "NaN");
			}
			for (e = S(u), i = !1, o = Math.sqrt(+u), o == 0 || o == 1 / 0 ? (t = y(u.d), (t.length + e) % 2 == 0 && (t += "0"), o = Math.sqrt(t), e = c((e + 1) / 2) - (e < 0 || e % 2), o == 1 / 0 ? t = "5e" + e : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e), r = new d(t)) : r = new d(o.toString()), n = d.precision, o = l = n + 3;;) if (s = r, r = s.plus(b(u, s, l + 2)).times(.5), y(s.d).slice(0, l) === (t = y(r.d)).slice(0, l)) {
				if (t = t.slice(l - 3, l + 1), o == l && t == "4999") {
					if (D(s, n + 1, 0), s.times(s).eq(u)) {
						r = s;
						break;
					}
				} else if (t != "9999") break;
				l += 4;
			}
			return i = !0, D(r, n);
		}, g.times = g.mul = function(e) {
			var t, n, r, a, o, s, c, l, u, d = this, p = d.constructor, m = d.d, h = (e = new p(e)).d;
			if (!d.s || !e.s) return new p(0);
			for (e.s *= d.s, n = d.e + e.e, l = m.length, u = h.length, l < u && (o = m, m = h, h = o, s = l, l = u, u = s), o = [], s = l + u, r = s; r--;) o.push(0);
			for (r = u; --r >= 0;) {
				for (t = 0, a = l + r; a > r;) c = o[a] + h[r] * m[a - r - 1] + t, o[a--] = c % f | 0, t = c / f | 0;
				o[a] = (o[a] + t) % f | 0;
			}
			for (; !o[--s];) o.pop();
			return t ? ++n : o.shift(), e.d = o, e.e = n, i ? D(e, p.precision) : e;
		}, g.toDecimalPlaces = g.todp = function(e, t) {
			var r = this, i = r.constructor;
			return r = new i(r), e === void 0 ? r : (v(e, 0, n), t === void 0 ? t = i.rounding : v(t, 0, 8), D(r, e + S(r) + 1, t));
		}, g.toExponential = function(e, t) {
			var r, i = this, a = i.constructor;
			return e === void 0 ? r = k(i, !0) : (v(e, 0, n), t === void 0 ? t = a.rounding : v(t, 0, 8), i = D(new a(i), e + 1, t), r = k(i, !0, e + 1)), r;
		}, g.toFixed = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? k(a) : (v(e, 0, n), t === void 0 ? t = o.rounding : v(t, 0, 8), i = D(new o(a), e + S(a) + 1, t), r = k(i.abs(), !1, e + S(i) + 1), a.isneg() && !a.isZero() ? "-" + r : r);
		}, g.toInteger = g.toint = function() {
			var e = this, t = e.constructor;
			return D(new t(e), S(e) + 1, t.rounding);
		}, g.toNumber = function() {
			return +this;
		}, g.toPower = g.pow = function(e) {
			var t, n, r, o, s, l, u = this, f = u.constructor, h = 12, g = +(e = new f(e));
			if (!e.s) return new f(d);
			if (u = new f(u), !u.s) {
				if (e.s < 1) throw Error(a + "Infinity");
				return u;
			}
			if (u.eq(d)) return u;
			if (r = f.precision, e.eq(d)) return D(u, r);
			if (t = e.e, n = e.d.length - 1, l = t >= n, s = u.s, !l) {
				if (s < 0) throw Error(a + "NaN");
			} else if ((n = g < 0 ? -g : g) <= m) {
				for (o = new f(d), t = Math.ceil(r / p + 4), i = !1; n % 2 && (o = o.times(u), A(o.d, t)), n = c(n / 2), n !== 0;) u = u.times(u), A(u.d, t);
				return i = !0, e.s < 0 ? new f(d).div(o) : D(o, r);
			}
			return s = s < 0 && e.d[Math.max(t, n)] & 1 ? -1 : 1, u.s = 1, i = !1, o = e.times(T(u, r + h)), i = !0, o = x(o), o.s = s, o;
		}, g.toPrecision = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? (r = S(a), i = k(a, r <= o.toExpNeg || r >= o.toExpPos)) : (v(e, 1, n), t === void 0 ? t = o.rounding : v(t, 0, 8), a = D(new o(a), e, t), r = S(a), i = k(a, e <= r || r <= o.toExpNeg, e)), i;
		}, g.toSignificantDigits = g.tosd = function(e, t) {
			var r = this, i = r.constructor;
			return e === void 0 ? (e = i.precision, t = i.rounding) : (v(e, 1, n), t === void 0 ? t = i.rounding : v(t, 0, 8)), D(new i(r), e, t);
		}, g.toString = g.valueOf = g.val = g.toJSON = function() {
			var e = this, t = S(e), n = e.constructor;
			return k(e, t <= n.toExpNeg || t >= n.toExpPos);
		};
		function _(e, t) {
			var n, r, a, o, s, c, l, u, d = e.constructor, m = d.precision;
			if (!e.s || !t.s) return t.s || (t = new d(e)), i ? D(t, m) : t;
			if (l = e.d, u = t.d, s = e.e, a = t.e, l = l.slice(), o = s - a, o) {
				for (o < 0 ? (r = l, o = -o, c = u.length) : (r = u, a = s, c = l.length), s = Math.ceil(m / p), c = s > c ? s + 1 : c + 1, o > c && (o = c, r.length = 1), r.reverse(); o--;) r.push(0);
				r.reverse();
			}
			for (c = l.length, o = u.length, c - o < 0 && (o = c, r = u, u = l, l = r), n = 0; o;) n = (l[--o] = l[o] + u[o] + n) / f | 0, l[o] %= f;
			for (n && (l.unshift(n), ++a), c = l.length; l[--c] == 0;) l.pop();
			return t.d = l, t.e = a, i ? D(t, m) : t;
		}
		function v(e, t, n) {
			if (e !== ~~e || e < t || e > n) throw Error(o + e);
		}
		function y(e) {
			var t, n, r, i = e.length - 1, a = "", o = e[0];
			if (i > 0) {
				for (a += o, t = 1; t < i; t++) r = e[t] + "", n = p - r.length, n && (a += w(n)), a += r;
				o = e[t], r = o + "", n = p - r.length, n && (a += w(n));
			} else if (o === 0) return "0";
			for (; o % 10 == 0;) o /= 10;
			return a + o;
		}
		var b = (function() {
			function e(e, t) {
				var n, r = 0, i = e.length;
				for (e = e.slice(); i--;) n = e[i] * t + r, e[i] = n % f | 0, r = n / f | 0;
				return r && e.unshift(r), e;
			}
			function t(e, t, n, r) {
				var i, a;
				if (n != r) a = n > r ? 1 : -1;
				else for (i = a = 0; i < n; i++) if (e[i] != t[i]) {
					a = e[i] > t[i] ? 1 : -1;
					break;
				}
				return a;
			}
			function n(e, t, n) {
				for (var r = 0; n--;) e[n] -= r, r = +(e[n] < t[n]), e[n] = r * f + e[n] - t[n];
				for (; !e[0] && e.length > 1;) e.shift();
			}
			return function(r, i, o, s) {
				var c, l, u, d, m, h, g, _, v, y, b, x, C, w, T, E, O, k, A = r.constructor, j = r.s == i.s ? 1 : -1, M = r.d, N = i.d;
				if (!r.s) return new A(r);
				if (!i.s) throw Error(a + "Division by zero");
				for (l = r.e - i.e, O = N.length, T = M.length, g = new A(j), _ = g.d = [], u = 0; N[u] == (M[u] || 0);) ++u;
				if (N[u] > (M[u] || 0) && --l, x = o == null ? o = A.precision : s ? o + (S(r) - S(i)) + 1 : o, x < 0) return new A(0);
				if (x = x / p + 2 | 0, u = 0, O == 1) for (d = 0, N = N[0], x++; (u < T || d) && x--; u++) C = d * f + (M[u] || 0), _[u] = C / N | 0, d = C % N | 0;
				else {
					for (d = f / (N[0] + 1) | 0, d > 1 && (N = e(N, d), M = e(M, d), O = N.length, T = M.length), w = O, v = M.slice(0, O), y = v.length; y < O;) v[y++] = 0;
					k = N.slice(), k.unshift(0), E = N[0], N[1] >= f / 2 && ++E;
					do
						d = 0, c = t(N, v, O, y), c < 0 ? (b = v[0], O != y && (b = b * f + (v[1] || 0)), d = b / E | 0, d > 1 ? (d >= f && (d = f - 1), m = e(N, d), h = m.length, y = v.length, c = t(m, v, h, y), c == 1 && (d--, n(m, O < h ? k : N, h))) : (d == 0 && (c = d = 1), m = N.slice()), h = m.length, h < y && m.unshift(0), n(v, m, y), c == -1 && (y = v.length, c = t(N, v, O, y), c < 1 && (d++, n(v, O < y ? k : N, y))), y = v.length) : c === 0 && (d++, v = [0]), _[u++] = d, c && v[0] ? v[y++] = M[w] || 0 : (v = [M[w]], y = 1);
					while ((w++ < T || v[0] !== void 0) && x--);
				}
				return _[0] || _.shift(), g.e = l, D(g, s ? o + S(g) + 1 : o);
			};
		})();
		function x(e, t) {
			var n, r, a, o, c, u, f = 0, p = 0, m = e.constructor, h = m.precision;
			if (S(e) > 16) throw Error(s + S(e));
			if (!e.s) return new m(d);
			for (t == null ? (i = !1, u = h) : u = t, c = new m(.03125); e.abs().gte(.1);) e = e.times(c), p += 5;
			for (r = Math.log(l(2, p)) / Math.LN10 * 2 + 5 | 0, u += r, n = a = o = new m(d), m.precision = u;;) {
				if (a = D(a.times(e), u), n = n.times(++f), c = o.plus(b(a, n, u)), y(c.d).slice(0, u) === y(o.d).slice(0, u)) {
					for (; p--;) o = D(o.times(o), u);
					return m.precision = h, t == null ? (i = !0, D(o, h)) : o;
				}
				o = c;
			}
		}
		function S(e) {
			for (var t = e.e * p, n = e.d[0]; n >= 10; n /= 10) t++;
			return t;
		}
		function C(e, t, n) {
			if (t > e.LN10.sd()) throw i = !0, n && (e.precision = n), Error(a + "LN10 precision limit exceeded");
			return D(new e(e.LN10), t);
		}
		function w(e) {
			for (var t = ""; e--;) t += "0";
			return t;
		}
		function T(e, t) {
			var n, r, o, s, c, l, u, f, p, m = 1, h = 10, g = e, _ = g.d, v = g.constructor, x = v.precision;
			if (g.s < 1) throw Error(a + (g.s ? "NaN" : "-Infinity"));
			if (g.eq(d)) return new v(0);
			if (t == null ? (i = !1, f = x) : f = t, g.eq(10)) return t ?? (i = !0), C(v, f);
			if (f += h, v.precision = f, n = y(_), r = n.charAt(0), s = S(g), Math.abs(s) < 0x5543df729c000) {
				for (; r < 7 && r != 1 || r == 1 && n.charAt(1) > 3;) g = g.times(e), n = y(g.d), r = n.charAt(0), m++;
				s = S(g), r > 1 ? (g = new v("0." + n), s++) : g = new v(r + "." + n.slice(1));
			} else return u = C(v, f + 2, x).times(s + ""), g = T(new v(r + "." + n.slice(1)), f - h).plus(u), v.precision = x, t == null ? (i = !0, D(g, x)) : g;
			for (l = c = g = b(g.minus(d), g.plus(d), f), p = D(g.times(g), f), o = 3;;) {
				if (c = D(c.times(p), f), u = l.plus(b(c, new v(o), f)), y(u.d).slice(0, f) === y(l.d).slice(0, f)) return l = l.times(2), s !== 0 && (l = l.plus(C(v, f + 2, x).times(s + ""))), l = b(l, new v(m), f), v.precision = x, t == null ? (i = !0, D(l, x)) : l;
				l = u, o += 2;
			}
		}
		function E(e, t) {
			var n, r, a;
			for ((n = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (r = t.search(/e/i)) > 0 ? (n < 0 && (n = r), n += +t.slice(r + 1), t = t.substring(0, r)) : n < 0 && (n = t.length), r = 0; t.charCodeAt(r) === 48;) ++r;
			for (a = t.length; t.charCodeAt(a - 1) === 48;) --a;
			if (t = t.slice(r, a), t) {
				if (a -= r, n = n - r - 1, e.e = c(n / p), e.d = [], r = (n + 1) % p, n < 0 && (r += p), r < a) {
					for (r && e.d.push(+t.slice(0, r)), a -= p; r < a;) e.d.push(+t.slice(r, r += p));
					t = t.slice(r), r = p - t.length;
				} else r -= a;
				for (; r--;) t += "0";
				if (e.d.push(+t), i && (e.e > h || e.e < -h)) throw Error(s + n);
			} else e.s = 0, e.e = 0, e.d = [0];
			return e;
		}
		function D(e, t, n) {
			var r, a, o, u, d, m, g, _, v = e.d;
			for (u = 1, o = v[0]; o >= 10; o /= 10) u++;
			if (r = t - u, r < 0) r += p, a = t, g = v[_ = 0];
			else {
				if (_ = Math.ceil((r + 1) / p), o = v.length, _ >= o) return e;
				for (g = o = v[_], u = 1; o >= 10; o /= 10) u++;
				r %= p, a = r - p + u;
			}
			if (n !== void 0 && (o = l(10, u - a - 1), d = g / o % 10 | 0, m = t < 0 || v[_ + 1] !== void 0 || g % o, m = n < 4 ? (d || m) && (n == 0 || n == (e.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (n == 4 || m || n == 6 && (r > 0 ? a > 0 ? g / l(10, u - a) : 0 : v[_ - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7))), t < 1 || !v[0]) return m ? (o = S(e), v.length = 1, t = t - o - 1, v[0] = l(10, (p - t % p) % p), e.e = c(-t / p) || 0) : (v.length = 1, v[0] = e.e = e.s = 0), e;
			if (r == 0 ? (v.length = _, o = 1, _--) : (v.length = _ + 1, o = l(10, p - r), v[_] = a > 0 ? (g / l(10, u - a) % l(10, a) | 0) * o : 0), m) for (;;) if (_ == 0) {
				(v[0] += o) == f && (v[0] = 1, ++e.e);
				break;
			} else {
				if (v[_] += o, v[_] != f) break;
				v[_--] = 0, o = 1;
			}
			for (r = v.length; v[--r] === 0;) v.pop();
			if (i && (e.e > h || e.e < -h)) throw Error(s + S(e));
			return e;
		}
		function O(e, t) {
			var n, r, a, o, s, c, l, u, d, m, h = e.constructor, g = h.precision;
			if (!e.s || !t.s) return t.s ? t.s = -t.s : t = new h(e), i ? D(t, g) : t;
			if (l = e.d, m = t.d, r = t.e, u = e.e, l = l.slice(), s = u - r, s) {
				for (d = s < 0, d ? (n = l, s = -s, c = m.length) : (n = m, r = u, c = l.length), a = Math.max(Math.ceil(g / p), c) + 2, s > a && (s = a, n.length = 1), n.reverse(), a = s; a--;) n.push(0);
				n.reverse();
			} else {
				for (a = l.length, c = m.length, d = a < c, d && (c = a), a = 0; a < c; a++) if (l[a] != m[a]) {
					d = l[a] < m[a];
					break;
				}
				s = 0;
			}
			for (d && (n = l, l = m, m = n, t.s = -t.s), c = l.length, a = m.length - c; a > 0; --a) l[c++] = 0;
			for (a = m.length; a > s;) {
				if (l[--a] < m[a]) {
					for (o = a; o && l[--o] === 0;) l[o] = f - 1;
					--l[o], l[a] += f;
				}
				l[a] -= m[a];
			}
			for (; l[--c] === 0;) l.pop();
			for (; l[0] === 0; l.shift()) --r;
			return l[0] ? (t.d = l, t.e = r, i ? D(t, g) : t) : new h(0);
		}
		function k(e, t, n) {
			var r, i = S(e), a = y(e.d), o = a.length;
			return t ? (n && (r = n - o) > 0 ? a = a.charAt(0) + "." + a.slice(1) + w(r) : o > 1 && (a = a.charAt(0) + "." + a.slice(1)), a = a + (i < 0 ? "e" : "e+") + i) : i < 0 ? (a = "0." + w(-i - 1) + a, n && (r = n - o) > 0 && (a += w(r))) : i >= o ? (a += w(i + 1 - o), n && (r = n - i - 1) > 0 && (a = a + "." + w(r))) : ((r = i + 1) < o && (a = a.slice(0, r) + "." + a.slice(r)), n && (r = n - o) > 0 && (i + 1 === o && (a += "."), a += w(r))), e.s < 0 ? "-" + a : a;
		}
		function A(e, t) {
			if (e.length > t) return e.length = t, !0;
		}
		function j(e) {
			var t, n, r;
			function i(e) {
				var t = this;
				if (!(t instanceof i)) return new i(e);
				if (t.constructor = i, e instanceof i) t.s = e.s, t.e = e.e, t.d = (e = e.d) ? e.slice() : e;
				else {
					if (typeof e == "number") {
						if (e * 0 != 0) throw Error(o + e);
						if (e > 0) t.s = 1;
						else if (e < 0) e = -e, t.s = -1;
						else {
							t.s = 0, t.e = 0, t.d = [0];
							return;
						}
						if (e === ~~e && e < 1e7) {
							t.e = 0, t.d = [e];
							return;
						}
						return E(t, e.toString());
					}
					if (typeof e != "string") throw Error(o + e);
					if (e.charCodeAt(0) === 45 ? (e = e.slice(1), t.s = -1) : t.s = 1, u.test(e)) E(t, e);
					else throw Error(o + e);
				}
			}
			if (i.prototype = g, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = j, i.config = i.set = M, e === void 0 && (e = {}), e) for (r = [
				"precision",
				"rounding",
				"toExpNeg",
				"toExpPos",
				"LN10"
			], t = 0; t < r.length;) e.hasOwnProperty(n = r[t++]) || (e[n] = this[n]);
			return i.config(e), i;
		}
		function M(e) {
			if (!e || typeof e != "object") throw Error(a + "Object expected");
			var t, r, i, s = [
				"precision",
				1,
				n,
				"rounding",
				0,
				8,
				"toExpNeg",
				-1 / 0,
				0,
				"toExpPos",
				0,
				1 / 0
			];
			for (t = 0; t < s.length; t += 3) if ((i = e[r = s[t]]) !== void 0) {
				if (c(i) === i && i >= s[t + 1] && i <= s[t + 2]) this[r] = i;
				else throw Error(o + r + ": " + i);
			}
			if ((i = e[r = "LN10"]) !== void 0) {
				if (i == Math.LN10) this[r] = new this(i);
				else throw Error(o + r + ": " + i);
			}
			return this;
		}
		r = j(r), r.default = r.Decimal = r, d = new r(1), typeof define == "function" && define.amd ? define(function() {
			return r;
		}) : t !== void 0 && t.exports ? t.exports = r : (e ||= typeof self < "u" && self && self.self == self ? self : Function("return this")(), e.Decimal = r);
	})(e);
})))());
function pg(e) {
	return e === 0 ? 1 : Math.floor(new $.default(e).abs().log(10).toNumber()) + 1;
}
function mg(e, t, n) {
	for (var r = new $.default(e), i = 0, a = []; r.lt(t) && i < 1e5;) a.push(r.toNumber()), r = r.add(n), i++;
	return a;
}
//#endregion
//#region node_modules/recharts/es6/util/scale/getNiceTickValues.js
function hg(e, t) {
	return bg(e) || yg(e, t) || _g(e, t) || gg();
}
function gg() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _g(e, t) {
	if (e) {
		if (typeof e == "string") return vg(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? vg(e, t) : void 0;
	}
}
function vg(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function yg(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function bg(e) {
	if (Array.isArray(e)) return e;
}
var xg = (e) => {
	var t = hg(e, 2), n = t[0], r = t[1], i = n, a = r;
	return n > r && (i = r, a = n), [i, a];
}, Sg = (e, t, n) => {
	if (e.lte(0)) return new $.default(0);
	var r = pg(e.toNumber()), i = new $.default(10).pow(r), a = e.div(i), o = r === 1 ? .1 : .05, s = new $.default(Math.ceil(a.div(o).toNumber())).add(n).mul(o).mul(i);
	return t ? new $.default(s.toNumber()) : new $.default(Math.ceil(s.toNumber()));
}, Cg = (e, t, n) => {
	if (e.lte(0)) return new $.default(0);
	var r = [
		1,
		2,
		2.5,
		5
	], i = e.toNumber(), a = Math.floor(new $.default(i).abs().log(10).toNumber()), o = new $.default(10).pow(a), s = e.div(o).toNumber(), c = r.findIndex((e) => e >= s - 1e-10);
	if (c === -1 && (o = o.mul(10), c = 0), c += n, c >= r.length) {
		var l = Math.floor(c / r.length);
		c %= r.length, o = o.mul(new $.default(10).pow(l));
	}
	var u = r[c] ?? 1, d = new $.default(u).mul(o);
	return t ? d : new $.default(Math.ceil(d.toNumber()));
}, wg = (e, t, n) => {
	var r = new $.default(1), i = new $.default(e);
	if (!i.isint() && n) {
		var a = Math.abs(e);
		a < 1 ? (r = new $.default(10).pow(pg(e) - 1), i = new $.default(Math.floor(i.div(r).toNumber())).mul(r)) : a > 1 && (i = new $.default(Math.floor(e)));
	} else e === 0 ? i = new $.default(Math.floor((t - 1) / 2)) : n || (i = new $.default(Math.floor(e)));
	for (var o = Math.floor((t - 1) / 2), s = [], c = 0; c < t; c++) s.push(i.add(new $.default(c - o).mul(r)).toNumber());
	return s;
}, Tg = function(e, t, n, r) {
	var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0, a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : Sg;
	if (!Number.isFinite((t - e) / (n - 1))) return {
		step: new $.default(0),
		tickMin: new $.default(0),
		tickMax: new $.default(0)
	};
	var o = a(new $.default(t).sub(e).div(n - 1), r, i), s;
	e <= 0 && t >= 0 ? s = new $.default(0) : (s = new $.default(e).add(t).div(2), s = s.sub(new $.default(s).mod(o)));
	var c = Math.ceil(s.sub(e).div(o).toNumber()), l = Math.ceil(new $.default(t).sub(s).div(o).toNumber()), u = c + l + 1;
	return u > n ? Tg(e, t, n, r, i + 1, a) : (u < n && (l = t > 0 ? l + (n - u) : l, c = t > 0 ? c : c + (n - u)), {
		step: o,
		tickMin: s.sub(new $.default(c).mul(o)),
		tickMax: s.add(new $.default(l).mul(o))
	});
}, Eg = function(e) {
	var t = hg(e, 2), n = t[0], r = t[1], i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = Math.max(i, 2), c = hg(xg([n, r]), 2), l = c[0], u = c[1];
	if (l === -Infinity || u === Infinity) {
		var d = u === Infinity ? [l, ...Array(i - 1).fill(Infinity)] : [...Array(i - 1).fill(-Infinity), u];
		return n > r ? d.reverse() : d;
	}
	if (l === u) return wg(l, i, a);
	var f = Tg(l, u, s, a, 0, o === "snap125" ? Cg : Sg), p = f.step, m = f.tickMin, h = f.tickMax, g = mg(m, h.add(new $.default(.1).mul(p)), p);
	return n > r ? g.reverse() : g;
}, Dg = function(e, t) {
	var n = hg(e, 2), r = n[0], i = n[1], a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = hg(xg([r, i]), 2), c = s[0], l = s[1];
	if (c === -Infinity || l === Infinity) return [r, i];
	if (c === l) return [c];
	var u = o === "snap125" ? Cg : Sg, d = Math.max(t, 2), f = u(new $.default(l).sub(c).div(d - 1), a, 0), p = [...mg(new $.default(c), new $.default(l), f), l];
	if (a === !1) {
		p = p.map((e) => Math.round(e));
		var m = p.length - 1;
		m > 0 && p[m] === p[m - 1] && (p = p.slice(0, m));
	}
	return r > i ? p.reverse() : p;
}, Og = (e) => e.rootProps.barCategoryGap, kg = (e) => e.rootProps.stackOffset, Ag = (e) => e.rootProps.reverseStackOrder, jg = (e) => e.options.chartName, Mg = (e) => e.rootProps.syncId, Ng = (e) => e.rootProps.syncMethod, Pg = (e) => e.options.eventEmitter, Fg = {
	grid: -100,
	barBackground: -50,
	area: 100,
	cursorRectangle: 200,
	bar: 300,
	line: 400,
	axis: 500,
	scatter: 600,
	activeBar: 1e3,
	cursorLine: 1100,
	activeDot: 1200,
	label: 2e3
}, Ig = {
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	allowDataOverflow: !1,
	angle: 0,
	angleAxisId: 0,
	axisLine: !0,
	axisLineType: "polygon",
	cx: 0,
	cy: 0,
	hide: !1,
	includeHidden: !1,
	label: !1,
	niceTicks: "auto",
	orientation: "outer",
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickLine: !0,
	tickSize: 8,
	type: "auto",
	zIndex: Fg.axis
}, Lg = {
	allowDataOverflow: !1,
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	angle: 0,
	axisLine: !0,
	includeHidden: !1,
	hide: !1,
	niceTicks: "auto",
	label: !1,
	orientation: "right",
	radiusAxisId: 0,
	reversed: !1,
	scale: "auto",
	stroke: "#ccc",
	tick: !0,
	tickCount: 5,
	tickLine: !0,
	type: "auto",
	zIndex: Fg.axis
}, Rg = (e, t) => {
	if (e && t) return e != null && e.reversed ? [t[1], t[0]] : t;
};
//#endregion
//#region node_modules/recharts/es6/util/getAxisTypeBasedOnLayout.js
function zg(e, t, n) {
	if (n !== "auto") return n;
	if (e != null) return Gu(e, t) ? "category" : "number";
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
function Bg(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Vg(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Bg(Object(n), !0).forEach(function(t) {
			Hg(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bg(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Hg(e, t, n) {
	return (t = Ug(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ug(e) {
	var t = Wg(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Wg(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Gg = {
	allowDataOverflow: Ig.allowDataOverflow,
	allowDecimals: Ig.allowDecimals,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	domain: void 0,
	id: Ig.angleAxisId,
	includeHidden: !1,
	name: void 0,
	reversed: Ig.reversed,
	scale: Ig.scale,
	tick: Ig.tick,
	tickCount: void 0,
	ticks: void 0,
	type: Ig.type,
	unit: void 0,
	niceTicks: "auto"
}, Kg = {
	allowDataOverflow: Lg.allowDataOverflow,
	allowDecimals: Lg.allowDecimals,
	allowDuplicatedCategory: Lg.allowDuplicatedCategory,
	dataKey: void 0,
	domain: void 0,
	id: Lg.radiusAxisId,
	includeHidden: Lg.includeHidden,
	name: void 0,
	reversed: Lg.reversed,
	scale: Lg.scale,
	tick: Lg.tick,
	tickCount: Lg.tickCount,
	ticks: void 0,
	type: Lg.type,
	unit: void 0,
	niceTicks: "auto"
}, qg = W([(e, t) => {
	if (t != null) return e.polarAxis.angleAxis[t];
}, gf], (e, t) => {
	if (e != null) return e;
	var n = zg(t, "angleAxis", Gg.type) ?? "category";
	return Vg(Vg({}, Gg), {}, { type: n });
}), Jg = W([(e, t) => e.polarAxis.radiusAxis[t], gf], (e, t) => {
	if (e != null) return e;
	var n = zg(t, "radiusAxis", Kg.type) ?? "category";
	return Vg(Vg({}, Kg), {}, { type: n });
}), Yg = (e) => e.polarOptions, Xg = W([
	ad,
	od,
	Sd
], Eh), Zg = W([Yg, Xg], (e, t) => {
	if (e != null) return ui(e.innerRadius, t, 0);
}), Qg = W([Yg, Xg], (e, t) => {
	if (e != null) return ui(e.outerRadius, t, t * .8);
}), $g = W([Yg], (e) => e == null ? [0, 0] : [e.startAngle, e.endAngle]);
W([qg, $g], Rg);
var e_ = W([
	Xg,
	Zg,
	Qg
], (e, t, n) => {
	if (e != null && t != null && n != null) return [t, n];
});
W([Jg, e_], Rg);
var t_ = W([
	mf,
	Yg,
	Zg,
	Qg,
	ad,
	od
], (e, t, n, r, i, a) => {
	if (!(e !== "centric" && e !== "radial" || t == null || n == null || r == null)) {
		var o = t.cx, s = t.cy, c = t.startAngle, l = t.endAngle;
		return {
			cx: ui(o, i, i / 2),
			cy: ui(s, a, a / 2),
			innerRadius: n,
			outerRadius: r,
			startAngle: c,
			endAngle: l,
			clockWise: !1
		};
	}
}), n_ = (e, t) => t, r_ = (e, t, n) => n;
//#endregion
//#region node_modules/recharts/es6/util/stacks/getStackSeriesIdentifier.js
function i_(e) {
	return e?.id;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineDisplayedStackedData.js
function a_(e, t, n) {
	var r = t.chartData, i = r === void 0 ? [] : r, a = n.allowDuplicatedCategory, o = n.dataKey, s = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		var t = e.data ?? i;
		if (t != null && t.length !== 0) {
			var n = i_(e);
			t.forEach((t, r) => {
				var i = o == null || a ? r : String(Uu(t, o, null)), c = Uu(t, e.dataKey, 0), l = s.has(i) ? s.get(i) : {};
				Object.assign(l, { [n]: c }), s.set(i, l);
			});
		}
	}), Array.from(s.values());
}
//#endregion
//#region node_modules/recharts/es6/state/types/StackedGraphicalItem.js
function o_(e) {
	return "stackId" in e && e.stackId != null && e.dataKey != null;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/numberDomainEqualityCheck.js
var s_ = (e, t) => e === t ? !0 : e == null || t == null ? !1 : e[0] === t[0] && e[1] === t[1];
//#endregion
//#region node_modules/recharts/es6/state/selectors/arrayEqualityCheck.js
function c_(e, t) {
	return Array.isArray(e) && Array.isArray(t) && e.length === 0 && t.length === 0 ? !0 : e === t;
}
function l_(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
		return !0;
	}
	return !1;
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectTooltipAxisType.js
var u_ = (e) => {
	var t = mf(e);
	return t === "horizontal" ? "xAxis" : t === "vertical" ? "yAxis" : t === "centric" ? "angleAxis" : "radiusAxis";
}, d_ = (e) => e.tooltip.settings.axisId;
//#endregion
//#region node_modules/recharts/es6/util/scale/RechartsScale.js
function f_(e) {
	if (e != null) {
		var t = e.ticks, n = e.bandwidth, r = e.range(), i = [Math.min(...r), Math.max(...r)];
		return {
			domain: () => e.domain(),
			range: function(e) {
				function t() {
					return e.apply(this, arguments);
				}
				return t.toString = function() {
					return e.toString();
				}, t;
			}(() => i),
			rangeMin: () => i[0],
			rangeMax: () => i[1],
			isInRange(e) {
				var t = i[0], n = i[1];
				return t <= n ? e >= t && e <= n : e >= n && e <= t;
			},
			bandwidth: n ? () => n.call(e) : void 0,
			ticks: t ? (n) => t.call(e, n) : void 0,
			map: (t, n) => {
				var r = e(t);
				if (r != null) {
					if (e.bandwidth && n != null && n.position) {
						var i = e.bandwidth();
						switch (n.position) {
							case "middle":
								r += i / 2;
								break;
							case "end": r += i;
						}
					}
					return r;
				}
			}
		};
	}
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineCheckedDomain.js
var p_ = (e, t) => {
	if (t != null) switch (e) {
		case "linear":
			if (!lg(t)) {
				for (var n, r, i = 0; i < t.length; i++) {
					var a = t[i];
					q(a) && ((n === void 0 || a < n) && (n = a), (r === void 0 || a > r) && (r = a));
				}
				return n !== void 0 && r !== void 0 ? [n, r] : void 0;
			}
			return t;
		default: return t;
	}
};
//#endregion
//#region node_modules/d3-array/src/ascending.js
function m_(e, t) {
	return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/descending.js
function h_(e, t) {
	return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/bisector.js
function g_(e) {
	let t, n, r;
	e.length === 2 ? (t = e === m_ || e === h_ ? e : __, n = e, r = e) : (t = m_, n = (t, n) => m_(e(t), n), r = (t, n) => e(t) - n);
	function i(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) < 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function a(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) <= 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function o(e, t, n = 0, a = e.length) {
		let o = i(e, t, n, a - 1);
		return o > n && r(e[o - 1], t) > -r(e[o], t) ? o - 1 : o;
	}
	return {
		left: i,
		center: o,
		right: a
	};
}
function __() {
	return 0;
}
//#endregion
//#region node_modules/d3-array/src/number.js
function v_(e) {
	return e === null ? NaN : +e;
}
function* y_(e, t) {
	if (t === void 0) for (let t of e) t != null && (t = +t) >= t && (yield t);
	else {
		let n = -1;
		for (let r of e) (r = t(r, ++n, e)) != null && (r = +r) >= r && (yield r);
	}
}
//#endregion
//#region node_modules/d3-array/src/bisect.js
var b_ = g_(m_), x_ = b_.right;
b_.left, g_(v_).center;
//#endregion
//#region node_modules/internmap/src/index.js
var S_ = class extends Map {
	constructor(e, t = E_) {
		if (super(), Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: t }
		}), e != null) for (let [t, n] of e) this.set(t, n);
	}
	get(e) {
		return super.get(C_(this, e));
	}
	has(e) {
		return super.has(C_(this, e));
	}
	set(e, t) {
		return super.set(w_(this, e), t);
	}
	delete(e) {
		return super.delete(T_(this, e));
	}
};
function C_({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : n;
}
function w_({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : (e.set(r, n), n);
}
function T_({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) && (n = e.get(r), e.delete(r)), n;
}
function E_(e) {
	return typeof e == "object" && e ? e.valueOf() : e;
}
//#endregion
//#region node_modules/d3-array/src/sort.js
function D_(e = m_) {
	if (e === m_) return O_;
	if (typeof e != "function") throw TypeError("compare is not a function");
	return (t, n) => {
		let r = e(t, n);
		return r || r === 0 ? r : (e(n, n) === 0) - (e(t, t) === 0);
	};
}
function O_(e, t) {
	return (e == null || !(e >= e)) - (t == null || !(t >= t)) || (e < t ? -1 : +(e > t));
}
//#endregion
//#region node_modules/d3-array/src/ticks.js
var k_ = Math.sqrt(50), A_ = Math.sqrt(10), j_ = Math.sqrt(2);
function M_(e, t, n) {
	let r = (t - e) / Math.max(0, n), i = Math.floor(Math.log10(r)), a = r / 10 ** i, o = a >= k_ ? 10 : a >= A_ ? 5 : a >= j_ ? 2 : 1, s, c, l;
	return i < 0 ? (l = 10 ** -i / o, s = Math.round(e * l), c = Math.round(t * l), s / l < e && ++s, c / l > t && --c, l = -l) : (l = 10 ** i * o, s = Math.round(e / l), c = Math.round(t / l), s * l < e && ++s, c * l > t && --c), c < s && .5 <= n && n < 2 ? M_(e, t, n * 2) : [
		s,
		c,
		l
	];
}
function N_(e, t, n) {
	if (t = +t, e = +e, n = +n, !(n > 0)) return [];
	if (e === t) return [e];
	let r = t < e, [i, a, o] = r ? M_(t, e, n) : M_(e, t, n);
	if (!(a >= i)) return [];
	let s = a - i + 1, c = Array(s);
	if (r) {
		if (o < 0) for (let e = 0; e < s; ++e) c[e] = (a - e) / -o;
		else for (let e = 0; e < s; ++e) c[e] = (a - e) * o;
	} else if (o < 0) for (let e = 0; e < s; ++e) c[e] = (i + e) / -o;
	else for (let e = 0; e < s; ++e) c[e] = (i + e) * o;
	return c;
}
function P_(e, t, n) {
	return t = +t, e = +e, n = +n, M_(e, t, n)[2];
}
function F_(e, t, n) {
	t = +t, e = +e, n = +n;
	let r = t < e, i = r ? P_(t, e, n) : P_(e, t, n);
	return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
//#endregion
//#region node_modules/d3-array/src/max.js
function I_(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n < t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n < i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
//#endregion
//#region node_modules/d3-array/src/min.js
function L_(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n > t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n > i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
//#endregion
//#region node_modules/d3-array/src/quickselect.js
function R_(e, t, n = 0, r = Infinity, i) {
	if (t = Math.floor(t), n = Math.floor(Math.max(0, n)), r = Math.floor(Math.min(e.length - 1, r)), !(n <= t && t <= r)) return e;
	for (i = i === void 0 ? O_ : D_(i); r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1), u = Math.max(n, Math.floor(t - o * c / a + l)), d = Math.min(r, Math.floor(t + (a - o) * c / a + l));
			R_(e, t, u, d, i);
		}
		let a = e[t], o = n, s = r;
		for (z_(e, n, t), i(e[r], a) > 0 && z_(e, n, r); o < s;) {
			for (z_(e, o, s), ++o, --s; i(e[o], a) < 0;) ++o;
			for (; i(e[s], a) > 0;) --s;
		}
		i(e[n], a) === 0 ? z_(e, n, s) : (++s, z_(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
	return e;
}
function z_(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
//#endregion
//#region node_modules/d3-array/src/quantile.js
function B_(e, t, n) {
	if (e = Float64Array.from(y_(e, n)), (r = e.length) && !isNaN(t = +t)) {
		if (t <= 0 || r < 2) return L_(e);
		if (t >= 1) return I_(e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = I_(R_(e, a).subarray(0, a + 1));
		return o + (L_(e.subarray(a + 1)) - o) * (i - a);
	}
}
function V_(e, t, n = v_) {
	if ((r = e.length) && !isNaN(t = +t)) {
		if (t <= 0 || r < 2) return +n(e[0], 0, e);
		if (t >= 1) return +n(e[r - 1], r - 1, e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = +n(e[a], a, e);
		return o + (+n(e[a + 1], a + 1, e) - o) * (i - a);
	}
}
//#endregion
//#region node_modules/d3-array/src/range.js
function H_(e, t, n) {
	e = +e, t = +t, n = (i = arguments.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
	for (var r = -1, i = Math.max(0, Math.ceil((t - e) / n)) | 0, a = Array(i); ++r < i;) a[r] = e + r * n;
	return a;
}
//#endregion
//#region node_modules/d3-scale/src/init.js
function U_(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(e);
			break;
		default: this.range(t).domain(e);
	}
	return this;
}
function W_(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			typeof e == "function" ? this.interpolator(e) : this.range(e);
			break;
		default: this.domain(e), typeof t == "function" ? this.interpolator(t) : this.range(t);
	}
	return this;
}
//#endregion
//#region node_modules/d3-scale/src/ordinal.js
var G_ = Symbol("implicit");
function K_() {
	var e = new S_(), t = [], n = [], r = G_;
	function i(i) {
		let a = e.get(i);
		if (a === void 0) {
			if (r !== G_) return r;
			e.set(i, a = t.push(i) - 1);
		}
		return n[a % n.length];
	}
	return i.domain = function(n) {
		if (!arguments.length) return t.slice();
		t = [], e = new S_();
		for (let r of n) e.has(r) || e.set(r, t.push(r) - 1);
		return i;
	}, i.range = function(e) {
		return arguments.length ? (n = Array.from(e), i) : n.slice();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return K_(t, n).unknown(r);
	}, U_.apply(i, arguments), i;
}
//#endregion
//#region node_modules/d3-scale/src/band.js
function q_() {
	var e = K_().unknown(void 0), t = e.domain, n = e.range, r = 0, i = 1, a, o, s = !1, c = 0, l = 0, u = .5;
	delete e.unknown;
	function d() {
		var e = t().length, d = i < r, f = d ? i : r, p = d ? r : i;
		a = (p - f) / Math.max(1, e - c + l * 2), s && (a = Math.floor(a)), f += (p - f - a * (e - c)) * u, o = a * (1 - c), s && (f = Math.round(f), o = Math.round(o));
		var m = H_(e).map(function(e) {
			return f + a * e;
		});
		return n(d ? m.reverse() : m);
	}
	return e.domain = function(e) {
		return arguments.length ? (t(e), d()) : t();
	}, e.range = function(e) {
		return arguments.length ? ([r, i] = e, r = +r, i = +i, d()) : [r, i];
	}, e.rangeRound = function(e) {
		return [r, i] = e, r = +r, i = +i, s = !0, d();
	}, e.bandwidth = function() {
		return o;
	}, e.step = function() {
		return a;
	}, e.round = function(e) {
		return arguments.length ? (s = !!e, d()) : s;
	}, e.padding = function(e) {
		return arguments.length ? (c = Math.min(1, l = +e), d()) : c;
	}, e.paddingInner = function(e) {
		return arguments.length ? (c = Math.min(1, e), d()) : c;
	}, e.paddingOuter = function(e) {
		return arguments.length ? (l = +e, d()) : l;
	}, e.align = function(e) {
		return arguments.length ? (u = Math.max(0, Math.min(1, e)), d()) : u;
	}, e.copy = function() {
		return q_(t(), [r, i]).round(s).paddingInner(c).paddingOuter(l).align(u);
	}, U_.apply(d(), arguments);
}
function J_(e) {
	var t = e.copy;
	return e.padding = e.paddingOuter, delete e.paddingInner, delete e.paddingOuter, e.copy = function() {
		return J_(t());
	}, e;
}
function Y_() {
	return J_(q_.apply(null, arguments).paddingInner(1));
}
//#endregion
//#region node_modules/d3-scale/src/constant.js
function X_(e) {
	return function() {
		return e;
	};
}
//#endregion
//#region node_modules/d3-scale/src/number.js
function Z_(e) {
	return +e;
}
//#endregion
//#region node_modules/d3-scale/src/continuous.js
var Q_ = [0, 1];
function $_(e) {
	return e;
}
function ev(e, t) {
	return (t -= e = +e) ? function(n) {
		return (n - e) / t;
	} : X_(isNaN(t) ? NaN : .5);
}
function tv(e, t) {
	var n;
	return e > t && (n = e, e = t, t = n), function(n) {
		return Math.max(e, Math.min(t, n));
	};
}
function nv(e, t, n) {
	var r = e[0], i = e[1], a = t[0], o = t[1];
	return i < r ? (r = ev(i, r), a = n(o, a)) : (r = ev(r, i), a = n(a, o)), function(e) {
		return a(r(e));
	};
}
function rv(e, t, n) {
	var r = Math.min(e.length, t.length) - 1, i = Array(r), a = Array(r), o = -1;
	for (e[r] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++o < r;) i[o] = ev(e[o], e[o + 1]), a[o] = n(t[o], t[o + 1]);
	return function(t) {
		var n = x_(e, t, 1, r) - 1;
		return a[n](i[n](t));
	};
}
function iv(e, t) {
	return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function av() {
	var e = Q_, t = Q_, n = zt, r, i, a, o = $_, s, c, l;
	function u() {
		var n = Math.min(e.length, t.length);
		return o !== $_ && (o = tv(e[0], e[n - 1])), s = n > 2 ? rv : nv, c = l = null, d;
	}
	function d(i) {
		return i == null || isNaN(i = +i) ? a : (c ||= s(e.map(r), t, n))(r(o(i)));
	}
	return d.invert = function(n) {
		return o(i((l ||= s(t, e.map(r), Mt))(n)));
	}, d.domain = function(t) {
		return arguments.length ? (e = Array.from(t, Z_), u()) : e.slice();
	}, d.range = function(e) {
		return arguments.length ? (t = Array.from(e), u()) : t.slice();
	}, d.rangeRound = function(e) {
		return t = Array.from(e), n = Bt, u();
	}, d.clamp = function(e) {
		return arguments.length ? (o = e ? !0 : $_, u()) : o !== $_;
	}, d.interpolate = function(e) {
		return arguments.length ? (n = e, u()) : n;
	}, d.unknown = function(e) {
		return arguments.length ? (a = e, d) : a;
	}, function(e, t) {
		return r = e, i = t, u();
	};
}
function ov() {
	return av()($_, $_);
}
//#endregion
//#region node_modules/d3-format/src/formatDecimal.js
function sv(e) {
	return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function cv(e, t) {
	if (!isFinite(e) || e === 0) return null;
	var n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e"), r = e.slice(0, n);
	return [r.length > 1 ? r[0] + r.slice(2) : r, +e.slice(n + 1)];
}
//#endregion
//#region node_modules/d3-format/src/exponent.js
function lv(e) {
	return e = cv(Math.abs(e)), e ? e[1] : NaN;
}
//#endregion
//#region node_modules/d3-format/src/formatGroup.js
function uv(e, t) {
	return function(n, r) {
		for (var i = n.length, a = [], o = 0, s = e[0], c = 0; i > 0 && s > 0 && (c + s + 1 > r && (s = Math.max(1, r - c)), a.push(n.substring(i -= s, i + s)), !((c += s + 1) > r));) s = e[o = (o + 1) % e.length];
		return a.reverse().join(t);
	};
}
//#endregion
//#region node_modules/d3-format/src/formatNumerals.js
function dv(e) {
	return function(t) {
		return t.replace(/[0-9]/g, function(t) {
			return e[+t];
		});
	};
}
//#endregion
//#region node_modules/d3-format/src/formatSpecifier.js
var fv = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function pv(e) {
	if (!(t = fv.exec(e))) throw Error("invalid format: " + e);
	var t;
	return new mv({
		fill: t[1],
		align: t[2],
		sign: t[3],
		symbol: t[4],
		zero: t[5],
		width: t[6],
		comma: t[7],
		precision: t[8] && t[8].slice(1),
		trim: t[9],
		type: t[10]
	});
}
pv.prototype = mv.prototype;
function mv(e) {
	this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
mv.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
//#endregion
//#region node_modules/d3-format/src/formatTrim.js
function hv(e) {
	out: for (var t = e.length, n = 1, r = -1, i; n < t; ++n) switch (e[n]) {
		case ".":
			r = i = n;
			break;
		case "0":
			r === 0 && (r = n), i = n;
			break;
		default:
			if (!+e[n]) break out;
			r > 0 && (r = 0);
	}
	return r > 0 ? e.slice(0, r) + e.slice(i + 1) : e;
}
//#endregion
//#region node_modules/d3-format/src/formatPrefixAuto.js
var gv;
function _v(e, t) {
	var n = cv(e, t);
	if (!n) return gv = void 0, e.toPrecision(t);
	var r = n[0], i = n[1], a = i - (gv = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
	return a === o ? r : a > o ? r + Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + Array(1 - a).join("0") + cv(e, Math.max(0, t + a - 1))[0];
}
//#endregion
//#region node_modules/d3-format/src/formatRounded.js
function vv(e, t) {
	var n = cv(e, t);
	if (!n) return e + "";
	var r = n[0], i = n[1];
	return i < 0 ? "0." + Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + Array(i - r.length + 2).join("0");
}
//#endregion
//#region node_modules/d3-format/src/formatTypes.js
var yv = {
	"%": (e, t) => (e * 100).toFixed(t),
	b: (e) => Math.round(e).toString(2),
	c: (e) => e + "",
	d: sv,
	e: (e, t) => e.toExponential(t),
	f: (e, t) => e.toFixed(t),
	g: (e, t) => e.toPrecision(t),
	o: (e) => Math.round(e).toString(8),
	p: (e, t) => vv(e * 100, t),
	r: vv,
	s: _v,
	X: (e) => Math.round(e).toString(16).toUpperCase(),
	x: (e) => Math.round(e).toString(16)
};
//#endregion
//#region node_modules/d3-format/src/identity.js
function bv(e) {
	return e;
}
//#endregion
//#region node_modules/d3-format/src/locale.js
var xv = Array.prototype.map, Sv = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function Cv(e) {
	var t = e.grouping === void 0 || e.thousands === void 0 ? bv : uv(xv.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", r = e.currency === void 0 ? "" : e.currency[1] + "", i = e.decimal === void 0 ? "." : e.decimal + "", a = e.numerals === void 0 ? bv : dv(xv.call(e.numerals, String)), o = e.percent === void 0 ? "%" : e.percent + "", s = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
	function l(e, l) {
		e = pv(e);
		var u = e.fill, d = e.align, f = e.sign, p = e.symbol, m = e.zero, h = e.width, g = e.comma, _ = e.precision, v = e.trim, y = e.type;
		y === "n" ? (g = !0, y = "g") : yv[y] || (_ === void 0 && (_ = 12), v = !0, y = "g"), (m || u === "0" && d === "=") && (m = !0, u = "0", d = "=");
		var b = (l && l.prefix !== void 0 ? l.prefix : "") + (p === "$" ? n : p === "#" && /[boxX]/.test(y) ? "0" + y.toLowerCase() : ""), x = (p === "$" ? r : /[%p]/.test(y) ? o : "") + (l && l.suffix !== void 0 ? l.suffix : ""), S = yv[y], C = /[defgprs%]/.test(y);
		_ = _ === void 0 ? 6 : /[gprs]/.test(y) ? Math.max(1, Math.min(21, _)) : Math.max(0, Math.min(20, _));
		function w(e) {
			var n = b, r = x, o, l, p;
			if (y === "c") r = S(e) + r, e = "";
			else {
				e = +e;
				var w = e < 0 || 1 / e < 0;
				if (e = isNaN(e) ? c : S(Math.abs(e), _), v && (e = hv(e)), w && +e == 0 && f !== "+" && (w = !1), n = (w ? f === "(" ? f : s : f === "-" || f === "(" ? "" : f) + n, r = (y === "s" && !isNaN(e) && gv !== void 0 ? Sv[8 + gv / 3] : "") + r + (w && f === "(" ? ")" : ""), C) {
					for (o = -1, l = e.length; ++o < l;) if (p = e.charCodeAt(o), 48 > p || p > 57) {
						r = (p === 46 ? i + e.slice(o + 1) : e.slice(o)) + r, e = e.slice(0, o);
						break;
					}
				}
			}
			g && !m && (e = t(e, Infinity));
			var T = n.length + e.length + r.length, E = T < h ? Array(h - T + 1).join(u) : "";
			switch (g && m && (e = t(E + e, E.length ? h - r.length : Infinity), E = ""), d) {
				case "<":
					e = n + e + r + E;
					break;
				case "=":
					e = n + E + e + r;
					break;
				case "^":
					e = E.slice(0, T = E.length >> 1) + n + e + r + E.slice(T);
					break;
				default: e = E + n + e + r;
			}
			return a(e);
		}
		return w.toString = function() {
			return e + "";
		}, w;
	}
	function u(e, t) {
		var n = Math.max(-8, Math.min(8, Math.floor(lv(t) / 3))) * 3, r = 10 ** -n, i = l((e = pv(e), e.type = "f", e), { suffix: Sv[8 + n / 3] });
		return function(e) {
			return i(r * e);
		};
	}
	return {
		format: l,
		formatPrefix: u
	};
}
//#endregion
//#region node_modules/d3-format/src/defaultLocale.js
var wv, Tv, Ev;
Dv({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function Dv(e) {
	return wv = Cv(e), Tv = wv.format, Ev = wv.formatPrefix, wv;
}
//#endregion
//#region node_modules/d3-format/src/precisionFixed.js
function Ov(e) {
	return Math.max(0, -lv(Math.abs(e)));
}
//#endregion
//#region node_modules/d3-format/src/precisionPrefix.js
function kv(e, t) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(lv(t) / 3))) * 3 - lv(Math.abs(e)));
}
//#endregion
//#region node_modules/d3-format/src/precisionRound.js
function Av(e, t) {
	return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, lv(t) - lv(e)) + 1;
}
//#endregion
//#region node_modules/d3-scale/src/tickFormat.js
function jv(e, t, n, r) {
	var i = F_(e, t, n), a;
	switch (r = pv(r ?? ",f"), r.type) {
		case "s":
			var o = Math.max(Math.abs(e), Math.abs(t));
			return r.precision == null && !isNaN(a = kv(i, o)) && (r.precision = a), Ev(r, o);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			r.precision == null && !isNaN(a = Av(i, Math.max(Math.abs(e), Math.abs(t)))) && (r.precision = a - (r.type === "e"));
			break;
		case "f":
		case "%": r.precision == null && !isNaN(a = Ov(i)) && (r.precision = a - (r.type === "%") * 2);
	}
	return Tv(r);
}
//#endregion
//#region node_modules/d3-scale/src/linear.js
function Mv(e) {
	var t = e.domain;
	return e.ticks = function(e) {
		var n = t();
		return N_(n[0], n[n.length - 1], e ?? 10);
	}, e.tickFormat = function(e, n) {
		var r = t();
		return jv(r[0], r[r.length - 1], e ?? 10, n);
	}, e.nice = function(n) {
		n ??= 10;
		var r = t(), i = 0, a = r.length - 1, o = r[i], s = r[a], c, l, u = 10;
		for (s < o && (l = o, o = s, s = l, l = i, i = a, a = l); u-- > 0;) {
			if (l = P_(o, s, n), l === c) return r[i] = o, r[a] = s, t(r);
			if (l > 0) o = Math.floor(o / l) * l, s = Math.ceil(s / l) * l;
			else if (l < 0) o = Math.ceil(o * l) / l, s = Math.floor(s * l) / l;
			else break;
			c = l;
		}
		return e;
	}, e;
}
function Nv() {
	var e = ov();
	return e.copy = function() {
		return iv(e, Nv());
	}, U_.apply(e, arguments), Mv(e);
}
//#endregion
//#region node_modules/d3-scale/src/identity.js
function Pv(e) {
	var t;
	function n(e) {
		return e == null || isNaN(e = +e) ? t : e;
	}
	return n.invert = n, n.domain = n.range = function(t) {
		return arguments.length ? (e = Array.from(t, Z_), n) : e.slice();
	}, n.unknown = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.copy = function() {
		return Pv(e).unknown(t);
	}, e = arguments.length ? Array.from(e, Z_) : [0, 1], Mv(n);
}
//#endregion
//#region node_modules/d3-scale/src/nice.js
function Fv(e, t) {
	e = e.slice();
	var n = 0, r = e.length - 1, i = e[n], a = e[r], o;
	return a < i && (o = n, n = r, r = o, o = i, i = a, a = o), e[n] = t.floor(i), e[r] = t.ceil(a), e;
}
//#endregion
//#region node_modules/d3-scale/src/log.js
function Iv(e) {
	return Math.log(e);
}
function Lv(e) {
	return Math.exp(e);
}
function Rv(e) {
	return -Math.log(-e);
}
function zv(e) {
	return -Math.exp(-e);
}
function Bv(e) {
	return isFinite(e) ? +("1e" + e) : e < 0 ? 0 : e;
}
function Vv(e) {
	return e === 10 ? Bv : e === Math.E ? Math.exp : (t) => e ** +t;
}
function Hv(e) {
	return e === Math.E ? Math.log : e === 10 && Math.log10 || e === 2 && Math.log2 || (e = Math.log(e), (t) => Math.log(t) / e);
}
function Uv(e) {
	return (t, n) => -e(-t, n);
}
function Wv(e) {
	let t = e(Iv, Lv), n = t.domain, r = 10, i, a;
	function o() {
		return i = Hv(r), a = Vv(r), n()[0] < 0 ? (i = Uv(i), a = Uv(a), e(Rv, zv)) : e(Iv, Lv), t;
	}
	return t.base = function(e) {
		return arguments.length ? (r = +e, o()) : r;
	}, t.domain = function(e) {
		return arguments.length ? (n(e), o()) : n();
	}, t.ticks = (e) => {
		let t = n(), o = t[0], s = t[t.length - 1], c = s < o;
		c && ([o, s] = [s, o]);
		let l = i(o), u = i(s), d, f, p = e == null ? 10 : +e, m = [];
		if (!(r % 1) && u - l < p) {
			if (l = Math.floor(l), u = Math.ceil(u), o > 0) {
				for (; l <= u; ++l) for (d = 1; d < r; ++d) if (f = l < 0 ? d / a(-l) : d * a(l), !(f < o)) {
					if (f > s) break;
					m.push(f);
				}
			} else for (; l <= u; ++l) for (d = r - 1; d >= 1; --d) if (f = l > 0 ? d / a(-l) : d * a(l), !(f < o)) {
				if (f > s) break;
				m.push(f);
			}
			m.length * 2 < p && (m = N_(o, s, p));
		} else m = N_(l, u, Math.min(u - l, p)).map(a);
		return c ? m.reverse() : m;
	}, t.tickFormat = (e, n) => {
		if (e ??= 10, n ??= r === 10 ? "s" : ",", typeof n != "function" && (!(r % 1) && (n = pv(n)).precision == null && (n.trim = !0), n = Tv(n)), e === Infinity) return n;
		let o = Math.max(1, r * e / t.ticks().length);
		return (e) => {
			let t = e / a(Math.round(i(e)));
			return t * r < r - .5 && (t *= r), t <= o ? n(e) : "";
		};
	}, t.nice = () => n(Fv(n(), {
		floor: (e) => a(Math.floor(i(e))),
		ceil: (e) => a(Math.ceil(i(e)))
	})), t;
}
function Gv() {
	let e = Wv(av()).domain([1, 10]);
	return e.copy = () => iv(e, Gv()).base(e.base()), U_.apply(e, arguments), e;
}
//#endregion
//#region node_modules/d3-scale/src/symlog.js
function Kv(e) {
	return function(t) {
		return Math.sign(t) * Math.log1p(Math.abs(t / e));
	};
}
function qv(e) {
	return function(t) {
		return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
	};
}
function Jv(e) {
	var t = 1, n = e(Kv(t), qv(t));
	return n.constant = function(n) {
		return arguments.length ? e(Kv(t = +n), qv(t)) : t;
	}, Mv(n);
}
function Yv() {
	var e = Jv(av());
	return e.copy = function() {
		return iv(e, Yv()).constant(e.constant());
	}, U_.apply(e, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/pow.js
function Xv(e) {
	return function(t) {
		return t < 0 ? -((-t) ** +e) : t ** +e;
	};
}
function Zv(e) {
	return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function Qv(e) {
	return e < 0 ? -e * e : e * e;
}
function $v(e) {
	var t = e($_, $_), n = 1;
	function r() {
		return n === 1 ? e($_, $_) : n === .5 ? e(Zv, Qv) : e(Xv(n), Xv(1 / n));
	}
	return t.exponent = function(e) {
		return arguments.length ? (n = +e, r()) : n;
	}, Mv(t);
}
function ey() {
	var e = $v(av());
	return e.copy = function() {
		return iv(e, ey()).exponent(e.exponent());
	}, U_.apply(e, arguments), e;
}
function ty() {
	return ey.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/d3-scale/src/radial.js
function ny(e) {
	return Math.sign(e) * e * e;
}
function ry(e) {
	return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function iy() {
	var e = ov(), t = [0, 1], n = !1, r;
	function i(t) {
		var i = ry(e(t));
		return isNaN(i) ? r : n ? Math.round(i) : i;
	}
	return i.invert = function(t) {
		return e.invert(ny(t));
	}, i.domain = function(t) {
		return arguments.length ? (e.domain(t), i) : e.domain();
	}, i.range = function(n) {
		return arguments.length ? (e.range((t = Array.from(n, Z_)).map(ny)), i) : t.slice();
	}, i.rangeRound = function(e) {
		return i.range(e).round(!0);
	}, i.round = function(e) {
		return arguments.length ? (n = !!e, i) : n;
	}, i.clamp = function(t) {
		return arguments.length ? (e.clamp(t), i) : e.clamp();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return iy(e.domain(), t).round(n).clamp(e.clamp()).unknown(r);
	}, U_.apply(i, arguments), Mv(i);
}
//#endregion
//#region node_modules/d3-scale/src/quantile.js
function ay() {
	var e = [], t = [], n = [], r;
	function i() {
		var r = 0, i = Math.max(1, t.length);
		for (n = Array(i - 1); ++r < i;) n[r - 1] = V_(e, r / i);
		return a;
	}
	function a(e) {
		return e == null || isNaN(e = +e) ? r : t[x_(n, e)];
	}
	return a.invertExtent = function(r) {
		var i = t.indexOf(r);
		return i < 0 ? [NaN, NaN] : [i > 0 ? n[i - 1] : e[0], i < n.length ? n[i] : e[e.length - 1]];
	}, a.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(m_), i();
	}, a.range = function(e) {
		return arguments.length ? (t = Array.from(e), i()) : t.slice();
	}, a.unknown = function(e) {
		return arguments.length ? (r = e, a) : r;
	}, a.quantiles = function() {
		return n.slice();
	}, a.copy = function() {
		return ay().domain(e).range(t).unknown(r);
	}, U_.apply(a, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/quantize.js
function oy() {
	var e = 0, t = 1, n = 1, r = [.5], i = [0, 1], a;
	function o(e) {
		return e != null && e <= e ? i[x_(r, e, 0, n)] : a;
	}
	function s() {
		var i = -1;
		for (r = Array(n); ++i < n;) r[i] = ((i + 1) * t - (i - n) * e) / (n + 1);
		return o;
	}
	return o.domain = function(n) {
		return arguments.length ? ([e, t] = n, e = +e, t = +t, s()) : [e, t];
	}, o.range = function(e) {
		return arguments.length ? (n = (i = Array.from(e)).length - 1, s()) : i.slice();
	}, o.invertExtent = function(a) {
		var o = i.indexOf(a);
		return o < 0 ? [NaN, NaN] : o < 1 ? [e, r[0]] : o >= n ? [r[n - 1], t] : [r[o - 1], r[o]];
	}, o.unknown = function(e) {
		return arguments.length && (a = e), o;
	}, o.thresholds = function() {
		return r.slice();
	}, o.copy = function() {
		return oy().domain([e, t]).range(i).unknown(a);
	}, U_.apply(Mv(o), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/threshold.js
function sy() {
	var e = [.5], t = [0, 1], n, r = 1;
	function i(i) {
		return i != null && i <= i ? t[x_(e, i, 0, r)] : n;
	}
	return i.domain = function(n) {
		return arguments.length ? (e = Array.from(n), r = Math.min(e.length, t.length - 1), i) : e.slice();
	}, i.range = function(n) {
		return arguments.length ? (t = Array.from(n), r = Math.min(e.length, t.length - 1), i) : t.slice();
	}, i.invertExtent = function(n) {
		var r = t.indexOf(n);
		return [e[r - 1], e[r]];
	}, i.unknown = function(e) {
		return arguments.length ? (n = e, i) : n;
	}, i.copy = function() {
		return sy().domain(e).range(t).unknown(n);
	}, U_.apply(i, arguments);
}
//#endregion
//#region node_modules/d3-time/src/interval.js
var cy = /* @__PURE__ */ new Date(), ly = /* @__PURE__ */ new Date();
function uy(e, t, n, r) {
	function i(t) {
		return e(t = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+t)), t;
	}
	return i.floor = (t) => (e(t = /* @__PURE__ */ new Date(+t)), t), i.ceil = (n) => (e(n = /* @__PURE__ */ new Date(n - 1)), t(n, 1), e(n), n), i.round = (e) => {
		let t = i(e), n = i.ceil(e);
		return e - t < n - e ? t : n;
	}, i.offset = (e, n) => (t(e = /* @__PURE__ */ new Date(+e), n == null ? 1 : Math.floor(n)), e), i.range = (n, r, a) => {
		let o = [];
		if (n = i.ceil(n), a = a == null ? 1 : Math.floor(a), !(n < r) || !(a > 0)) return o;
		let s;
		do
			o.push(s = /* @__PURE__ */ new Date(+n)), t(n, a), e(n);
		while (s < n && n < r);
		return o;
	}, i.filter = (n) => uy((t) => {
		if (t >= t) for (; e(t), !n(t);) t.setTime(t - 1);
	}, (e, r) => {
		if (e >= e) {
			if (r < 0) for (; ++r <= 0;) for (; t(e, -1), !n(e););
			else for (; --r >= 0;) for (; t(e, 1), !n(e););
		}
	}), n && (i.count = (t, r) => (cy.setTime(+t), ly.setTime(+r), e(cy), e(ly), Math.floor(n(cy, ly))), i.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? i.filter(r ? (t) => r(t) % e === 0 : (t) => i.count(0, t) % e === 0) : i)), i;
}
//#endregion
//#region node_modules/d3-time/src/millisecond.js
var dy = uy(() => {}, (e, t) => {
	e.setTime(+e + t);
}, (e, t) => t - e);
dy.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? uy((t) => {
	t.setTime(Math.floor(t / e) * e);
}, (t, n) => {
	t.setTime(+t + n * e);
}, (t, n) => (n - t) / e) : dy), dy.range;
//#endregion
//#region node_modules/d3-time/src/duration.js
var fy = 1e3, py = fy * 60, my = py * 60, hy = my * 24, gy = hy * 7, _y = hy * 30, vy = hy * 365, yy = uy((e) => {
	e.setTime(e - e.getMilliseconds());
}, (e, t) => {
	e.setTime(+e + t * fy);
}, (e, t) => (t - e) / fy, (e) => e.getUTCSeconds());
yy.range;
//#endregion
//#region node_modules/d3-time/src/minute.js
var by = uy((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * fy);
}, (e, t) => {
	e.setTime(+e + t * py);
}, (e, t) => (t - e) / py, (e) => e.getMinutes());
by.range;
var xy = uy((e) => {
	e.setUTCSeconds(0, 0);
}, (e, t) => {
	e.setTime(+e + t * py);
}, (e, t) => (t - e) / py, (e) => e.getUTCMinutes());
xy.range;
//#endregion
//#region node_modules/d3-time/src/hour.js
var Sy = uy((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * fy - e.getMinutes() * py);
}, (e, t) => {
	e.setTime(+e + t * my);
}, (e, t) => (t - e) / my, (e) => e.getHours());
Sy.range;
var Cy = uy((e) => {
	e.setUTCMinutes(0, 0, 0);
}, (e, t) => {
	e.setTime(+e + t * my);
}, (e, t) => (t - e) / my, (e) => e.getUTCHours());
Cy.range;
//#endregion
//#region node_modules/d3-time/src/day.js
var wy = uy((e) => e.setHours(0, 0, 0, 0), (e, t) => e.setDate(e.getDate() + t), (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * py) / hy, (e) => e.getDate() - 1);
wy.range;
var Ty = uy((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / hy, (e) => e.getUTCDate() - 1);
Ty.range;
var Ey = uy((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / hy, (e) => Math.floor(e / hy));
Ey.range;
//#endregion
//#region node_modules/d3-time/src/week.js
function Dy(e) {
	return uy((t) => {
		t.setDate(t.getDate() - (t.getDay() + 7 - e) % 7), t.setHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setDate(e.getDate() + t * 7);
	}, (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * py) / gy);
}
var Oy = Dy(0), ky = Dy(1), Ay = Dy(2), jy = Dy(3), My = Dy(4), Ny = Dy(5), Py = Dy(6);
Oy.range, ky.range, Ay.range, jy.range, My.range, Ny.range, Py.range;
function Fy(e) {
	return uy((t) => {
		t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 7 - e) % 7), t.setUTCHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setUTCDate(e.getUTCDate() + t * 7);
	}, (e, t) => (t - e) / gy);
}
var Iy = Fy(0), Ly = Fy(1), Ry = Fy(2), zy = Fy(3), By = Fy(4), Vy = Fy(5), Hy = Fy(6);
Iy.range, Ly.range, Ry.range, zy.range, By.range, Vy.range, Hy.range;
//#endregion
//#region node_modules/d3-time/src/month.js
var Uy = uy((e) => {
	e.setDate(1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setMonth(e.getMonth() + t);
}, (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12, (e) => e.getMonth());
Uy.range;
var Wy = uy((e) => {
	e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCMonth(e.getUTCMonth() + t);
}, (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12, (e) => e.getUTCMonth());
Wy.range;
//#endregion
//#region node_modules/d3-time/src/year.js
var Gy = uy((e) => {
	e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setFullYear(e.getFullYear() + t);
}, (e, t) => t.getFullYear() - e.getFullYear(), (e) => e.getFullYear());
Gy.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : uy((t) => {
	t.setFullYear(Math.floor(t.getFullYear() / e) * e), t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, n) => {
	t.setFullYear(t.getFullYear() + n * e);
}), Gy.range;
var Ky = uy((e) => {
	e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCFullYear(e.getUTCFullYear() + t);
}, (e, t) => t.getUTCFullYear() - e.getUTCFullYear(), (e) => e.getUTCFullYear());
Ky.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : uy((t) => {
	t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e), t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, n) => {
	t.setUTCFullYear(t.getUTCFullYear() + n * e);
}), Ky.range;
//#endregion
//#region node_modules/d3-time/src/ticks.js
function qy(e, t, n, r, i, a) {
	let o = [
		[
			yy,
			1,
			fy
		],
		[
			yy,
			5,
			5 * fy
		],
		[
			yy,
			15,
			15 * fy
		],
		[
			yy,
			30,
			30 * fy
		],
		[
			a,
			1,
			py
		],
		[
			a,
			5,
			5 * py
		],
		[
			a,
			15,
			15 * py
		],
		[
			a,
			30,
			30 * py
		],
		[
			i,
			1,
			my
		],
		[
			i,
			3,
			3 * my
		],
		[
			i,
			6,
			6 * my
		],
		[
			i,
			12,
			12 * my
		],
		[
			r,
			1,
			hy
		],
		[
			r,
			2,
			2 * hy
		],
		[
			n,
			1,
			gy
		],
		[
			t,
			1,
			_y
		],
		[
			t,
			3,
			3 * _y
		],
		[
			e,
			1,
			vy
		]
	];
	function s(e, t, n) {
		let r = t < e;
		r && ([e, t] = [t, e]);
		let i = n && typeof n.range == "function" ? n : c(e, t, n), a = i ? i.range(e, +t + 1) : [];
		return r ? a.reverse() : a;
	}
	function c(t, n, r) {
		let i = Math.abs(n - t) / r, a = g_(([, , e]) => e).right(o, i);
		if (a === o.length) return e.every(F_(t / vy, n / vy, r));
		if (a === 0) return dy.every(Math.max(F_(t, n, r), 1));
		let [s, c] = o[i / o[a - 1][2] < o[a][2] / i ? a - 1 : a];
		return s.every(c);
	}
	return [s, c];
}
var [Jy, Yy] = qy(Ky, Wy, Iy, Ey, Cy, xy), [Xy, Zy] = qy(Gy, Uy, Oy, wy, Sy, by);
//#endregion
//#region node_modules/d3-time-format/src/locale.js
function Qy(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
		return t.setFullYear(e.y), t;
	}
	return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function $y(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
		return t.setUTCFullYear(e.y), t;
	}
	return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function eb(e, t, n) {
	return {
		y: e,
		m: t,
		d: n,
		H: 0,
		M: 0,
		S: 0,
		L: 0
	};
}
function tb(e) {
	var t = e.dateTime, n = e.date, r = e.time, i = e.periods, a = e.days, o = e.shortDays, s = e.months, c = e.shortMonths, l = cb(i), u = lb(i), d = cb(a), f = lb(a), p = cb(o), m = lb(o), h = cb(s), g = lb(s), _ = cb(c), v = lb(c), y = {
		a: N,
		A: ee,
		b: te,
		B: ne,
		c: null,
		d: Ab,
		e: Ab,
		f: Fb,
		g: Kb,
		G: Jb,
		H: jb,
		I: Mb,
		j: Nb,
		L: Pb,
		m: Ib,
		M: Lb,
		p: re,
		q: ie,
		Q: _x,
		s: vx,
		S: Rb,
		u: zb,
		U: Bb,
		V: Hb,
		w: Ub,
		W: Wb,
		x: null,
		X: null,
		y: Gb,
		Y: qb,
		Z: Yb,
		"%": gx
	}, b = {
		a: ae,
		A: oe,
		b: P,
		B: se,
		c: null,
		d: Xb,
		e: Xb,
		f: tx,
		g: fx,
		G: mx,
		H: Zb,
		I: Qb,
		j: $b,
		L: ex,
		m: nx,
		M: rx,
		p: ce,
		q: le,
		Q: _x,
		s: vx,
		S: ix,
		u: ax,
		U: ox,
		V: cx,
		w: lx,
		W: ux,
		x: null,
		X: null,
		y: dx,
		Y: px,
		Z: hx,
		"%": gx
	}, x = {
		a: E,
		A: D,
		b: O,
		B: k,
		c: A,
		d: bb,
		e: bb,
		f: Eb,
		g: gb,
		G: hb,
		H: Sb,
		I: Sb,
		j: xb,
		L: Tb,
		m: yb,
		M: Cb,
		p: T,
		q: vb,
		Q: Ob,
		s: kb,
		S: wb,
		u: db,
		U: fb,
		V: pb,
		w: ub,
		W: mb,
		x: j,
		X: M,
		y: gb,
		Y: hb,
		Z: _b,
		"%": Db
	};
	y.x = S(n, y), y.X = S(r, y), y.c = S(t, y), b.x = S(n, b), b.X = S(r, b), b.c = S(t, b);
	function S(e, t) {
		return function(n) {
			var r = [], i = -1, a = 0, o = e.length, s, c, l;
			for (n instanceof Date || (n = /* @__PURE__ */ new Date(+n)); ++i < o;) e.charCodeAt(i) === 37 && (r.push(e.slice(a, i)), (c = nb[s = e.charAt(++i)]) == null ? c = s === "e" ? " " : "0" : s = e.charAt(++i), (l = t[s]) && (s = l(n, c)), r.push(s), a = i + 1);
			return r.push(e.slice(a, i)), r.join("");
		};
	}
	function C(e, t) {
		return function(n) {
			var r = eb(1900, void 0, 1), i = w(r, e, n += "", 0), a, o;
			if (i != n.length) return null;
			if ("Q" in r) return new Date(r.Q);
			if ("s" in r) return new Date(r.s * 1e3 + ("L" in r ? r.L : 0));
			if (t && !("Z" in r) && (r.Z = 0), "p" in r && (r.H = r.H % 12 + r.p * 12), r.m === void 0 && (r.m = "q" in r ? r.q : 0), "V" in r) {
				if (r.V < 1 || r.V > 53) return null;
				"w" in r || (r.w = 1), "Z" in r ? (a = $y(eb(r.y, 0, 1)), o = a.getUTCDay(), a = o > 4 || o === 0 ? Ly.ceil(a) : Ly(a), a = Ty.offset(a, (r.V - 1) * 7), r.y = a.getUTCFullYear(), r.m = a.getUTCMonth(), r.d = a.getUTCDate() + (r.w + 6) % 7) : (a = Qy(eb(r.y, 0, 1)), o = a.getDay(), a = o > 4 || o === 0 ? ky.ceil(a) : ky(a), a = wy.offset(a, (r.V - 1) * 7), r.y = a.getFullYear(), r.m = a.getMonth(), r.d = a.getDate() + (r.w + 6) % 7);
			} else ("W" in r || "U" in r) && ("w" in r || (r.w = "u" in r ? r.u % 7 : +("W" in r)), o = "Z" in r ? $y(eb(r.y, 0, 1)).getUTCDay() : Qy(eb(r.y, 0, 1)).getDay(), r.m = 0, r.d = "W" in r ? (r.w + 6) % 7 + r.W * 7 - (o + 5) % 7 : r.w + r.U * 7 - (o + 6) % 7);
			return "Z" in r ? (r.H += r.Z / 100 | 0, r.M += r.Z % 100, $y(r)) : Qy(r);
		};
	}
	function w(e, t, n, r) {
		for (var i = 0, a = t.length, o = n.length, s, c; i < a;) {
			if (r >= o) return -1;
			if (s = t.charCodeAt(i++), s === 37) {
				if (s = t.charAt(i++), c = x[s in nb ? t.charAt(i++) : s], !c || (r = c(e, n, r)) < 0) return -1;
			} else if (s != n.charCodeAt(r++)) return -1;
		}
		return r;
	}
	function T(e, t, n) {
		var r = l.exec(t.slice(n));
		return r ? (e.p = u.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function E(e, t, n) {
		var r = p.exec(t.slice(n));
		return r ? (e.w = m.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function D(e, t, n) {
		var r = d.exec(t.slice(n));
		return r ? (e.w = f.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function O(e, t, n) {
		var r = _.exec(t.slice(n));
		return r ? (e.m = v.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function k(e, t, n) {
		var r = h.exec(t.slice(n));
		return r ? (e.m = g.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function A(e, n, r) {
		return w(e, t, n, r);
	}
	function j(e, t, r) {
		return w(e, n, t, r);
	}
	function M(e, t, n) {
		return w(e, r, t, n);
	}
	function N(e) {
		return o[e.getDay()];
	}
	function ee(e) {
		return a[e.getDay()];
	}
	function te(e) {
		return c[e.getMonth()];
	}
	function ne(e) {
		return s[e.getMonth()];
	}
	function re(e) {
		return i[+(e.getHours() >= 12)];
	}
	function ie(e) {
		return 1 + ~~(e.getMonth() / 3);
	}
	function ae(e) {
		return o[e.getUTCDay()];
	}
	function oe(e) {
		return a[e.getUTCDay()];
	}
	function P(e) {
		return c[e.getUTCMonth()];
	}
	function se(e) {
		return s[e.getUTCMonth()];
	}
	function ce(e) {
		return i[+(e.getUTCHours() >= 12)];
	}
	function le(e) {
		return 1 + ~~(e.getUTCMonth() / 3);
	}
	return {
		format: function(e) {
			var t = S(e += "", y);
			return t.toString = function() {
				return e;
			}, t;
		},
		parse: function(e) {
			var t = C(e += "", !1);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcFormat: function(e) {
			var t = S(e += "", b);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcParse: function(e) {
			var t = C(e += "", !0);
			return t.toString = function() {
				return e;
			}, t;
		}
	};
}
var nb = {
	"-": "",
	_: " ",
	0: "0"
}, rb = /^\s*\d+/, ib = /^%/, ab = /[\\^$*+?|[\]().{}]/g;
function ob(e, t, n) {
	var r = e < 0 ? "-" : "", i = (r ? -e : e) + "", a = i.length;
	return r + (a < n ? Array(n - a + 1).join(t) + i : i);
}
function sb(e) {
	return e.replace(ab, "\\$&");
}
function cb(e) {
	return RegExp("^(?:" + e.map(sb).join("|") + ")", "i");
}
function lb(e) {
	return new Map(e.map((e, t) => [e.toLowerCase(), t]));
}
function ub(e, t, n) {
	var r = rb.exec(t.slice(n, n + 1));
	return r ? (e.w = +r[0], n + r[0].length) : -1;
}
function db(e, t, n) {
	var r = rb.exec(t.slice(n, n + 1));
	return r ? (e.u = +r[0], n + r[0].length) : -1;
}
function fb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.U = +r[0], n + r[0].length) : -1;
}
function pb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.V = +r[0], n + r[0].length) : -1;
}
function mb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.W = +r[0], n + r[0].length) : -1;
}
function hb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 4));
	return r ? (e.y = +r[0], n + r[0].length) : -1;
}
function gb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function _b(e, t, n) {
	var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(n, n + 6));
	return r ? (e.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function vb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 1));
	return r ? (e.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function yb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.m = r[0] - 1, n + r[0].length) : -1;
}
function bb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.d = +r[0], n + r[0].length) : -1;
}
function xb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 3));
	return r ? (e.m = 0, e.d = +r[0], n + r[0].length) : -1;
}
function Sb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.H = +r[0], n + r[0].length) : -1;
}
function Cb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.M = +r[0], n + r[0].length) : -1;
}
function wb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 2));
	return r ? (e.S = +r[0], n + r[0].length) : -1;
}
function Tb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 3));
	return r ? (e.L = +r[0], n + r[0].length) : -1;
}
function Eb(e, t, n) {
	var r = rb.exec(t.slice(n, n + 6));
	return r ? (e.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function Db(e, t, n) {
	var r = ib.exec(t.slice(n, n + 1));
	return r ? n + r[0].length : -1;
}
function Ob(e, t, n) {
	var r = rb.exec(t.slice(n));
	return r ? (e.Q = +r[0], n + r[0].length) : -1;
}
function kb(e, t, n) {
	var r = rb.exec(t.slice(n));
	return r ? (e.s = +r[0], n + r[0].length) : -1;
}
function Ab(e, t) {
	return ob(e.getDate(), t, 2);
}
function jb(e, t) {
	return ob(e.getHours(), t, 2);
}
function Mb(e, t) {
	return ob(e.getHours() % 12 || 12, t, 2);
}
function Nb(e, t) {
	return ob(1 + wy.count(Gy(e), e), t, 3);
}
function Pb(e, t) {
	return ob(e.getMilliseconds(), t, 3);
}
function Fb(e, t) {
	return Pb(e, t) + "000";
}
function Ib(e, t) {
	return ob(e.getMonth() + 1, t, 2);
}
function Lb(e, t) {
	return ob(e.getMinutes(), t, 2);
}
function Rb(e, t) {
	return ob(e.getSeconds(), t, 2);
}
function zb(e) {
	var t = e.getDay();
	return t === 0 ? 7 : t;
}
function Bb(e, t) {
	return ob(Oy.count(Gy(e) - 1, e), t, 2);
}
function Vb(e) {
	var t = e.getDay();
	return t >= 4 || t === 0 ? My(e) : My.ceil(e);
}
function Hb(e, t) {
	return e = Vb(e), ob(My.count(Gy(e), e) + (Gy(e).getDay() === 4), t, 2);
}
function Ub(e) {
	return e.getDay();
}
function Wb(e, t) {
	return ob(ky.count(Gy(e) - 1, e), t, 2);
}
function Gb(e, t) {
	return ob(e.getFullYear() % 100, t, 2);
}
function Kb(e, t) {
	return e = Vb(e), ob(e.getFullYear() % 100, t, 2);
}
function qb(e, t) {
	return ob(e.getFullYear() % 1e4, t, 4);
}
function Jb(e, t) {
	var n = e.getDay();
	return e = n >= 4 || n === 0 ? My(e) : My.ceil(e), ob(e.getFullYear() % 1e4, t, 4);
}
function Yb(e) {
	var t = e.getTimezoneOffset();
	return (t > 0 ? "-" : (t *= -1, "+")) + ob(t / 60 | 0, "0", 2) + ob(t % 60, "0", 2);
}
function Xb(e, t) {
	return ob(e.getUTCDate(), t, 2);
}
function Zb(e, t) {
	return ob(e.getUTCHours(), t, 2);
}
function Qb(e, t) {
	return ob(e.getUTCHours() % 12 || 12, t, 2);
}
function $b(e, t) {
	return ob(1 + Ty.count(Ky(e), e), t, 3);
}
function ex(e, t) {
	return ob(e.getUTCMilliseconds(), t, 3);
}
function tx(e, t) {
	return ex(e, t) + "000";
}
function nx(e, t) {
	return ob(e.getUTCMonth() + 1, t, 2);
}
function rx(e, t) {
	return ob(e.getUTCMinutes(), t, 2);
}
function ix(e, t) {
	return ob(e.getUTCSeconds(), t, 2);
}
function ax(e) {
	var t = e.getUTCDay();
	return t === 0 ? 7 : t;
}
function ox(e, t) {
	return ob(Iy.count(Ky(e) - 1, e), t, 2);
}
function sx(e) {
	var t = e.getUTCDay();
	return t >= 4 || t === 0 ? By(e) : By.ceil(e);
}
function cx(e, t) {
	return e = sx(e), ob(By.count(Ky(e), e) + (Ky(e).getUTCDay() === 4), t, 2);
}
function lx(e) {
	return e.getUTCDay();
}
function ux(e, t) {
	return ob(Ly.count(Ky(e) - 1, e), t, 2);
}
function dx(e, t) {
	return ob(e.getUTCFullYear() % 100, t, 2);
}
function fx(e, t) {
	return e = sx(e), ob(e.getUTCFullYear() % 100, t, 2);
}
function px(e, t) {
	return ob(e.getUTCFullYear() % 1e4, t, 4);
}
function mx(e, t) {
	var n = e.getUTCDay();
	return e = n >= 4 || n === 0 ? By(e) : By.ceil(e), ob(e.getUTCFullYear() % 1e4, t, 4);
}
function hx() {
	return "+0000";
}
function gx() {
	return "%";
}
function _x(e) {
	return +e;
}
function vx(e) {
	return Math.floor(e / 1e3);
}
//#endregion
//#region node_modules/d3-time-format/src/defaultLocale.js
var yx, bx, xx;
Sx({
	dateTime: "%x, %X",
	date: "%-m/%-d/%Y",
	time: "%-I:%M:%S %p",
	periods: ["AM", "PM"],
	days: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	shortDays: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	shortMonths: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
});
function Sx(e) {
	return yx = tb(e), bx = yx.format, yx.parse, xx = yx.utcFormat, yx.utcParse, yx;
}
//#endregion
//#region node_modules/d3-scale/src/time.js
function Cx(e) {
	return new Date(e);
}
function wx(e) {
	return e instanceof Date ? +e : +/* @__PURE__ */ new Date(+e);
}
function Tx(e, t, n, r, i, a, o, s, c, l) {
	var u = ov(), d = u.invert, f = u.domain, p = l(".%L"), m = l(":%S"), h = l("%I:%M"), g = l("%I %p"), _ = l("%a %d"), v = l("%b %d"), y = l("%B"), b = l("%Y");
	function x(e) {
		return (c(e) < e ? p : s(e) < e ? m : o(e) < e ? h : a(e) < e ? g : r(e) < e ? i(e) < e ? _ : v : n(e) < e ? y : b)(e);
	}
	return u.invert = function(e) {
		return new Date(d(e));
	}, u.domain = function(e) {
		return arguments.length ? f(Array.from(e, wx)) : f().map(Cx);
	}, u.ticks = function(t) {
		var n = f();
		return e(n[0], n[n.length - 1], t ?? 10);
	}, u.tickFormat = function(e, t) {
		return t == null ? x : l(t);
	}, u.nice = function(e) {
		var n = f();
		return (!e || typeof e.range != "function") && (e = t(n[0], n[n.length - 1], e ?? 10)), e ? f(Fv(n, e)) : u;
	}, u.copy = function() {
		return iv(u, Tx(e, t, n, r, i, a, o, s, c, l));
	}, u;
}
function Ex() {
	return U_.apply(Tx(Xy, Zy, Gy, Uy, Oy, wy, Sy, by, yy, bx).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/utcTime.js
function Dx() {
	return U_.apply(Tx(Jy, Yy, Ky, Wy, Iy, Ty, Cy, xy, yy, xx).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/sequential.js
function Ox() {
	var e = 0, t = 1, n, r, i, a, o = $_, s = !1, c;
	function l(e) {
		return e == null || isNaN(e = +e) ? c : o(i === 0 ? .5 : (e = (a(e) - n) * i, s ? Math.max(0, Math.min(1, e)) : e));
	}
	l.domain = function(o) {
		return arguments.length ? ([e, t] = o, n = a(e = +e), r = a(t = +t), i = n === r ? 0 : 1 / (r - n), l) : [e, t];
	}, l.clamp = function(e) {
		return arguments.length ? (s = !!e, l) : s;
	}, l.interpolator = function(e) {
		return arguments.length ? (o = e, l) : o;
	};
	function u(e) {
		return function(t) {
			var n, r;
			return arguments.length ? ([n, r] = t, o = e(n, r), l) : [o(0), o(1)];
		};
	}
	return l.range = u(zt), l.rangeRound = u(Bt), l.unknown = function(e) {
		return arguments.length ? (c = e, l) : c;
	}, function(o) {
		return a = o, n = o(e), r = o(t), i = n === r ? 0 : 1 / (r - n), l;
	};
}
function kx(e, t) {
	return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function Ax() {
	var e = Mv(Ox()($_));
	return e.copy = function() {
		return kx(e, Ax());
	}, W_.apply(e, arguments);
}
function jx() {
	var e = Wv(Ox()).domain([1, 10]);
	return e.copy = function() {
		return kx(e, jx()).base(e.base());
	}, W_.apply(e, arguments);
}
function Mx() {
	var e = Jv(Ox());
	return e.copy = function() {
		return kx(e, Mx()).constant(e.constant());
	}, W_.apply(e, arguments);
}
function Nx() {
	var e = $v(Ox());
	return e.copy = function() {
		return kx(e, Nx()).exponent(e.exponent());
	}, W_.apply(e, arguments);
}
function Px() {
	return Nx.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/d3-scale/src/sequentialQuantile.js
function Fx() {
	var e = [], t = $_;
	function n(n) {
		if (n != null && !isNaN(n = +n)) return t((x_(e, n, 1) - 1) / (e.length - 1));
	}
	return n.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(m_), n;
	}, n.interpolator = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.range = function() {
		return e.map((n, r) => t(r / (e.length - 1)));
	}, n.quantiles = function(t) {
		return Array.from({ length: t + 1 }, (n, r) => B_(e, r / t));
	}, n.copy = function() {
		return Fx(t).domain(e);
	}, W_.apply(n, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/diverging.js
function Ix() {
	var e = 0, t = .5, n = 1, r = 1, i, a, o, s, c, l = $_, u, d = !1, f;
	function p(e) {
		return isNaN(e = +e) ? f : (e = .5 + ((e = +u(e)) - a) * (r * e < r * a ? s : c), l(d ? Math.max(0, Math.min(1, e)) : e));
	}
	p.domain = function(l) {
		return arguments.length ? ([e, t, n] = l, i = u(e = +e), a = u(t = +t), o = u(n = +n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p) : [
			e,
			t,
			n
		];
	}, p.clamp = function(e) {
		return arguments.length ? (d = !!e, p) : d;
	}, p.interpolator = function(e) {
		return arguments.length ? (l = e, p) : l;
	};
	function m(e) {
		return function(t) {
			var n, r, i;
			return arguments.length ? ([n, r, i] = t, l = Vt(e, [
				n,
				r,
				i
			]), p) : [
				l(0),
				l(.5),
				l(1)
			];
		};
	}
	return p.range = m(zt), p.rangeRound = m(Bt), p.unknown = function(e) {
		return arguments.length ? (f = e, p) : f;
	}, function(l) {
		return u = l, i = l(e), a = l(t), o = l(n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p;
	};
}
function Lx() {
	var e = Mv(Ix()($_));
	return e.copy = function() {
		return kx(e, Lx());
	}, W_.apply(e, arguments);
}
function Rx() {
	var e = Wv(Ix()).domain([
		.1,
		1,
		10
	]);
	return e.copy = function() {
		return kx(e, Rx()).base(e.base());
	}, W_.apply(e, arguments);
}
function zx() {
	var e = Jv(Ix());
	return e.copy = function() {
		return kx(e, zx()).constant(e.constant());
	}, W_.apply(e, arguments);
}
function Bx() {
	var e = $v(Ix());
	return e.copy = function() {
		return kx(e, Bx()).exponent(e.exponent());
	}, W_.apply(e, arguments);
}
function Vx() {
	return Bx.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/victory-vendor/es/d3-scale.js
var Hx = /* @__PURE__ */ c({
	scaleBand: () => q_,
	scaleDiverging: () => Lx,
	scaleDivergingLog: () => Rx,
	scaleDivergingPow: () => Bx,
	scaleDivergingSqrt: () => Vx,
	scaleDivergingSymlog: () => zx,
	scaleIdentity: () => Pv,
	scaleImplicit: () => G_,
	scaleLinear: () => Nv,
	scaleLog: () => Gv,
	scaleOrdinal: () => K_,
	scalePoint: () => Y_,
	scalePow: () => ey,
	scaleQuantile: () => ay,
	scaleQuantize: () => oy,
	scaleRadial: () => iy,
	scaleSequential: () => Ax,
	scaleSequentialLog: () => jx,
	scaleSequentialPow: () => Nx,
	scaleSequentialQuantile: () => Fx,
	scaleSequentialSqrt: () => Px,
	scaleSequentialSymlog: () => Mx,
	scaleSqrt: () => ty,
	scaleSymlog: () => Yv,
	scaleThreshold: () => sy,
	scaleTime: () => Ex,
	scaleUtc: () => Dx,
	tickFormat: () => jv
});
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
function Ux(e) {
	var t = Hx;
	if (e in t && typeof t[e] == "function") return t[e]();
	var n = `scale${hi(e)}`;
	if (n in t && typeof t[n] == "function") return t[n]();
}
function Wx(e, t, n) {
	if (typeof e == "function") return e.copy().domain(t).range(n);
	if (e != null) {
		var r = Ux(e);
		if (r != null) return r.domain(t).range(n), r;
	}
}
function Gx(e, t, n, r) {
	if (n != null && r != null) return typeof e.scale == "function" ? Wx(e.scale, n, r) : Wx(t, n, r);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineRealScaleType.js
function Kx(e) {
	return `scale${hi(e)}`;
}
function qx(e) {
	return Kx(e) in Hx;
}
var Jx = (e, t, n) => {
	if (e != null) {
		var r = e.scale, i = e.type;
		if (r === "auto") return i === "category" && n && (n.indexOf("LineChart") >= 0 || n.indexOf("AreaChart") >= 0 || n.indexOf("ComposedChart") >= 0 && !t) ? "point" : i === "category" ? "band" : "linear";
		if (typeof r == "string") return qx(r) ? r : "point";
	}
};
//#endregion
//#region node_modules/recharts/es6/util/scale/createCategoricalInverse.js
function Yx(e, t) {
	for (var n = 0, r = e.length, i = e[0] < e[e.length - 1]; n < r;) {
		var a = Math.floor((n + r) / 2);
		(i ? e[a] < t : e[a] > t) ? n = a + 1 : r = a;
	}
	return n;
}
function Xx(e, t) {
	if (e) {
		var n = t ?? e.domain(), r = n.map((t) => e(t) ?? 0), i = e.range();
		if (!(n.length === 0 || i.length < 2)) return (e) => {
			var t = Yx(r, e);
			if (t <= 0) return n[0];
			if (t >= n.length) return n[n.length - 1];
			var i = r[t - 1] ?? 0, a = r[t] ?? 0;
			return Math.abs(e - i) <= Math.abs(e - a) ? n[t - 1] : n[t];
		};
	}
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineInverseScaleFunction.js
function Zx(e) {
	if (e != null) return "invert" in e && typeof e.invert == "function" ? e.invert.bind(e) : Xx(e, void 0);
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/axisSelectors.js
function Qx(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function $x(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Qx(Object(n), !0).forEach(function(t) {
			eS(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qx(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function eS(e, t, n) {
	return (t = tS(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function tS(e) {
	var t = nS(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function nS(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function rS(e, t) {
	return cS(e) || sS(e, t) || aS(e, t) || iS();
}
function iS() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function aS(e, t) {
	if (e) {
		if (typeof e == "string") return oS(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oS(e, t) : void 0;
	}
}
function oS(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function sS(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function cS(e) {
	if (Array.isArray(e)) return e;
}
var lS = [0, "auto"], uS = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: void 0,
	height: 30,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "bottom",
	padding: {
		left: 0,
		right: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "category",
	unit: void 0,
	niceTicks: "auto"
}, dS = (e, t) => e.cartesianAxis.xAxis[t], fS = (e, t) => dS(e, t) ?? uS, pS = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: lS,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "left",
	padding: {
		top: 0,
		bottom: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "number",
	unit: void 0,
	niceTicks: "auto",
	width: 60
}, mS = (e, t) => e.cartesianAxis.yAxis[t], hS = (e, t) => mS(e, t) ?? pS, gS = {
	domain: [0, "auto"],
	includeHidden: !1,
	reversed: !1,
	allowDataOverflow: !1,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	id: 0,
	name: "",
	range: [64, 64],
	scale: "auto",
	type: "number",
	unit: ""
}, _S = (e, t) => e.cartesianAxis.zAxis[t] ?? gS, vS = (e, t, n) => {
	switch (t) {
		case "xAxis": return fS(e, n);
		case "yAxis": return hS(e, n);
		case "zAxis": return _S(e, n);
		case "angleAxis": return qg(e, n);
		case "radiusAxis": return Jg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, yS = (e, t, n) => {
	switch (t) {
		case "xAxis": return fS(e, n);
		case "yAxis": return hS(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, bS = (e, t, n) => {
	switch (t) {
		case "xAxis": return fS(e, n);
		case "yAxis": return hS(e, n);
		case "angleAxis": return qg(e, n);
		case "radiusAxis": return Jg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, xS = (e) => e.graphicalItems.cartesianItems.some((e) => e.type === "bar") || e.graphicalItems.polarItems.some((e) => e.type === "radialBar");
function SS(e, t) {
	return (n) => {
		switch (e) {
			case "xAxis": return "xAxisId" in n && n.xAxisId === t;
			case "yAxis": return "yAxisId" in n && n.yAxisId === t;
			case "zAxis": return "zAxisId" in n && n.zAxisId === t;
			case "angleAxis": return "angleAxisId" in n && n.angleAxisId === t;
			case "radiusAxis": return "radiusAxisId" in n && n.radiusAxisId === t;
			default: return !1;
		}
	};
}
var CS = (e) => e.graphicalItems.cartesianItems, wS = W([n_, r_], SS), TS = (e, t, n) => e.filter(n).filter((e) => t?.includeHidden === !0 || !e.hide), ES = W([
	CS,
	vS,
	wS
], TS, { memoizeOptions: { resultEqualityCheck: c_ } }), DS = W([ES], (e) => e.filter((e) => e.type === "area" || e.type === "bar").filter(o_)), OS = (e) => e.filter((e) => !("stackId" in e) || e.stackId === void 0), kS = W([ES], OS), AS = (e) => e.map((e) => e.data).filter(Boolean).flat(1), jS = W([ES], (e) => e.some((e) => !e.data)), MS = W([ES], AS, { memoizeOptions: { resultEqualityCheck: c_ } }), NS = (e, t) => {
	var n = t.chartData, r = n === void 0 ? [] : n, i = t.dataStartIndex, a = t.dataEndIndex;
	return e.length > 0 ? e : r.slice(i, a + 1);
}, PS = W([MS, eg], NS), FS = (e, t, n) => t?.dataKey == null ? n.length > 0 ? n.map((e) => e.dataKey).flatMap((t) => e.map((e) => ({ value: Uu(e, t) }))) : e.map((e) => ({ value: e })) : e.map((e) => ({ value: Uu(e, t.dataKey) })), IS = (e, t, n, r, i, a) => {
	var o = r.chartData, s = o === void 0 ? [] : o, c = r.dataStartIndex, l = r.dataEndIndex, u = FS(e, t, n);
	return i && t?.dataKey != null && a.length > 0 ? [...s.slice(c, l + 1).map((e) => ({ value: Uu(e, t.dataKey) })).filter((e) => e.value != null), ...u] : u;
}, LS = W([
	PS,
	vS,
	ES,
	eg,
	jS,
	MS
], IS);
function RS(e) {
	if (si(e) || e instanceof Date) {
		var t = Number(e);
		if (q(t)) return t;
	}
}
function zS(e) {
	if (Array.isArray(e)) {
		var t = [RS(e[0]), RS(e[1])];
		return lg(t) ? t : void 0;
	}
	var n = RS(e);
	if (n != null) return [n, n];
}
function BS(e) {
	return e.map(RS).filter(gi);
}
function VS(e, t) {
	var n = RS(e), r = RS(t);
	return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
}
var HS = W([LS], (e) => e?.map((e) => e.value).sort(VS));
function US(e, t) {
	switch (e) {
		case "xAxis": return t.direction === "x";
		case "yAxis": return t.direction === "y";
		default: return !1;
	}
}
function WS(e, t, n) {
	if (!n || !n.length) return [];
	var r;
	if (typeof t == "number" && !ai(t)) r = t;
	else if (Array.isArray(t)) {
		var i = BS(t);
		i.length > 0 && (r = Math.max(...i));
	}
	return r == null ? [] : BS(n.flatMap((t) => {
		var n = Uu(e, t.dataKey), i, a;
		if (Array.isArray(n)) {
			var o = rS(n, 2);
			i = o[0], a = o[1];
		} else i = a = n;
		if (q(i) && q(a)) return [r - i, r + a];
	}));
}
var GS = (e) => bS(e, u_(e), d_(e)), KS = W([GS], (e) => e?.dataKey), qS = W([
	DS,
	eg,
	GS
], a_), JS = (e, t, n, r) => {
	var i = t.reduce((e, t) => {
		if (t.stackId == null) return e;
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, {});
	return Object.fromEntries(Object.entries(i).map((t) => {
		var i = rS(t, 2), a = i[0], o = i[1], s = r ? [...o].reverse() : o;
		return [a, {
			stackedData: Yu(e, s.map(i_), n),
			graphicalItems: s
		}];
	}));
}, YS = W([
	qS,
	DS,
	kg,
	Ag
], JS), XS = (e, t, n, r) => {
	var i = t.dataStartIndex, a = t.dataEndIndex;
	if (r == null && n !== "zAxis") return $u(e, i, a);
}, ZS = W([vS], (e) => e.allowDataOverflow), QS = (e) => {
	if (e == null || !("domain" in e)) return lS;
	if (e.domain != null) return e.domain;
	if ("ticks" in e && e.ticks != null) {
		if (e.type === "number") {
			var t = BS(e.ticks);
			return [Math.min(...t), Math.max(...t)];
		}
		if (e.type === "category") return e.ticks.map(String);
	}
	return e?.domain ?? lS;
}, $S = W([vS], QS), eC = W([$S, ZS], dg), tC = W([
	YS,
	Qh,
	n_,
	eC
], XS, { memoizeOptions: { resultEqualityCheck: s_ } }), nC = (e) => e.errorBars, rC = (e, t, n) => e.flatMap((e) => t[e.id]).filter(Boolean).filter((e) => US(n, e)), iC = function() {
	var e = [...arguments].filter(Boolean);
	if (e.length !== 0) {
		var t = e.flat();
		return [Math.min(...t), Math.max(...t)];
	}
}, aC = function(e, t, n, r, i) {
	var a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [], o, s;
	if (n.length > 0 && n.forEach((e) => {
		var n = e.data == null ? a : [...e.data], c = r[e.id]?.filter((e) => US(i, e));
		n.forEach((n) => {
			var r = Uu(n, t.dataKey ?? e.dataKey), i = WS(n, r, c);
			if (i.length >= 2) {
				var a = Math.min(...i), l = Math.max(...i);
				(o == null || a < o) && (o = a), (s == null || l > s) && (s = l);
			}
			var u = zS(r);
			u != null && (o = o == null ? u[0] : Math.min(o, u[0]), s = s == null ? u[1] : Math.max(s, u[1]));
		});
	}), t?.dataKey != null && n.length === 0 && e.forEach((e) => {
		var n = zS(Uu(e, t.dataKey));
		n != null && (o = o == null ? n[0] : Math.min(o, n[0]), s = s == null ? n[1] : Math.max(s, n[1]));
	}), q(o) && q(s)) return [o, s];
}, oC = W([
	PS,
	vS,
	kS,
	nC,
	n_,
	tg
], aC, { memoizeOptions: { resultEqualityCheck: s_ } });
function sC(e) {
	var t = e.value;
	if (si(t) || t instanceof Date) return t;
}
var cC = (e, t, n) => {
	var r = e.map(sC).filter((e) => e != null);
	return n && (t.dataKey == null || t.allowDuplicatedCategory && di(r)) ? Zh(0, e.length) : t.allowDuplicatedCategory ? r : Array.from(new Set(r));
}, lC = (e) => e.referenceElements.dots, uC = (e, t, n) => e.filter((e) => e.ifOverflow === "extendDomain").filter((e) => t === "xAxis" ? e.xAxisId === n : e.yAxisId === n), dC = W([
	lC,
	n_,
	r_
], uC), fC = (e) => e.referenceElements.areas, pC = W([
	fC,
	n_,
	r_
], uC), mC = (e) => e.referenceElements.lines, hC = W([
	mC,
	n_,
	r_
], uC), gC = (e, t) => {
	if (e != null) {
		var n = BS(e.map((e) => t === "xAxis" ? e.x : e.y));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, _C = W(dC, n_, gC), vC = (e, t) => {
	if (e != null) {
		var n = BS(e.flatMap((e) => [t === "xAxis" ? e.x1 : e.y1, t === "xAxis" ? e.x2 : e.y2]));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, yC = W([pC, n_], vC);
function bC(e) {
	if (e.x != null) return BS([e.x]);
	var t = e.segment?.map((e) => e.x);
	return t == null || t.length === 0 ? [] : BS(t);
}
function xC(e) {
	if (e.y != null) return BS([e.y]);
	var t = e.segment?.map((e) => e.y);
	return t == null || t.length === 0 ? [] : BS(t);
}
var SC = (e, t) => {
	if (e != null) {
		var n = e.flatMap((e) => t === "xAxis" ? bC(e) : xC(e));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, CC = W(_C, W([hC, n_], SC), yC, (e, t, n) => iC(e, n, t)), wC = (e, t, n, r, i, a, o, s, c) => {
	if (n != null) return n;
	var l = o === "vertical" && s === "xAxis" || o === "horizontal" && s === "yAxis" ? iC(r, a, i) : iC(a, i), u = fg(t, l, e.allowDataOverflow);
	return u == null && e.allowDataOverflow && l == null && c != null ? c : u;
}, TC = W([
	vS,
	$S,
	eC,
	tC,
	oC,
	CC,
	mf,
	n_,
	W([vS], (e) => {
		if (e != null && e.type === "number" && "ticks" in e && e.ticks != null) {
			var t = BS(e.ticks);
			if (t.length !== 0) return [Math.min(...t), Math.max(...t)];
		}
	}, { memoizeOptions: { resultEqualityCheck: s_ } })
], wC, { memoizeOptions: { resultEqualityCheck: s_ } }), EC = [0, 1], DC = (e, t, n, r, i, a, o) => {
	if (e != null && n != null && n.length !== 0 || o !== void 0) {
		var s = e.dataKey, c = e.type, l = Gu(t, a);
		return l && s == null ? Zh(0, n?.length ?? 0) : c === "category" ? cC(r, e, l) : i === "expand" && !l ? EC : o;
	}
}, OC = W([
	vS,
	mf,
	PS,
	LS,
	kg,
	n_,
	TC
], DC), kC = W([
	vS,
	xS,
	jg
], Jx), AC = (e, t, n) => {
	var r = t.niceTicks;
	if (r !== "none") {
		var i = QS(t), a = Array.isArray(i) && (i[0] === "auto" || i[1] === "auto");
		if ((r === "snap125" || r === "adaptive") && t != null && t.tickCount && lg(e)) {
			if (a) return Eg(e, t.tickCount, t.allowDecimals, r);
			if (t.type === "number") return Dg(e, t.tickCount, t.allowDecimals, r);
		}
		if (r === "auto" && n === "linear" && t != null && t.tickCount) {
			if (a && lg(e)) return Eg(e, t.tickCount, t.allowDecimals, "adaptive");
			if (t.type === "number" && lg(e)) return Dg(e, t.tickCount, t.allowDecimals, "adaptive");
		}
	}
}, jC = W([
	OC,
	bS,
	kC
], AC), MC = (e, t, n, r) => {
	if (r !== "angleAxis" && e?.type === "number" && lg(t) && Array.isArray(n) && n.length > 0) {
		var i = t[0], a = n[0] ?? 0, o = t[1], s = n[n.length - 1] ?? 0;
		return [Math.min(i, a), Math.max(o, s)];
	}
	return t;
}, NC = W([
	vS,
	OC,
	jC,
	n_
], MC), PC = W(W(LS, vS, (e, t) => {
	if (t && t.type === "number") {
		var n = Infinity, r = Array.from(BS(e.map((e) => e.value))).sort((e, t) => e - t), i = r[0], a = r[r.length - 1];
		if (i == null || a == null) return Infinity;
		var o = a - i;
		if (o === 0) return Infinity;
		for (var s = 0; s < r.length - 1; s++) {
			var c = r[s], l = r[s + 1];
			if (c != null && l != null) {
				var u = l - c;
				n = Math.min(n, u);
			}
		}
		return n / o;
	}
}), mf, Og, Sd, (e, t, n, r, i) => i, (e, t, n, r, i) => {
	if (!q(e)) return 0;
	var a = t === "vertical" ? r.height : r.width;
	if (i === "gap") return e * a / 2;
	if (i === "no-gap") {
		var o = ui(n, e * a), s = e * a / 2;
		return s - o - (s - o) / a * o;
	}
	return 0;
}), FC = (e, t, n) => {
	var r = fS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : PC(e, "xAxis", t, n, r.padding);
}, IC = (e, t, n) => {
	var r = hS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : PC(e, "yAxis", t, n, r.padding);
}, LC = W(fS, FC, (e, t) => {
	if (e == null) return {
		left: 0,
		right: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		left: t,
		right: t
	} : {
		left: (n.left ?? 0) + t,
		right: (n.right ?? 0) + t
	};
}), RC = W(hS, IC, (e, t) => {
	if (e == null) return {
		top: 0,
		bottom: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		top: t,
		bottom: t
	} : {
		top: (n.top ?? 0) + t,
		bottom: (n.bottom ?? 0) + t
	};
}), zC = W([
	Sd,
	LC,
	Od,
	Dd,
	(e, t, n) => n
], (e, t, n, r, i) => {
	var a = r.padding;
	return i ? [a.left, n.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
}), BC = W([
	Sd,
	mf,
	RC,
	Od,
	Dd,
	(e, t, n) => n
], (e, t, n, r, i, a) => {
	var o = i.padding;
	return a ? [r.height - o.bottom, o.top] : t === "horizontal" ? [e.top + e.height - n.bottom, e.top + n.top] : [e.top + n.top, e.top + e.height - n.bottom];
}), VC = (e, t, n, r) => {
	switch (t) {
		case "xAxis": return zC(e, n, r);
		case "yAxis": return BC(e, n, r);
		case "zAxis": return _S(e, n)?.range;
		case "angleAxis": return $g(e);
		case "radiusAxis": return e_(e, n);
		default: return;
	}
}, HC = W([vS, VC], Rg), UC = W([
	vS,
	kC,
	W([kC, NC], p_),
	HC
], Gx), WC = (e, t, n, r) => {
	if (n != null && n.dataKey != null) {
		var i = n.type, a = n.scale;
		if (Gu(e, r) && (i === "number" || a !== "auto")) return t.map((e) => e.value);
	}
}, GC = W([
	mf,
	LS,
	bS,
	n_
], WC), KC = W([UC], f_);
W([UC], Zx), W([UC, HS], Xx), W([
	ES,
	nC,
	n_
], rC);
function qC(e, t) {
	return e.id < t.id ? -1 : +(e.id > t.id);
}
var JC = (e, t) => t, YC = (e, t, n) => n, XC = W(ld, JC, YC, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(qC)), ZC = W(ud, JC, YC, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(qC)), QC = (e, t) => {
	var n = typeof t.height == "number" ? t.height : 30;
	return {
		width: e.width,
		height: n
	};
}, $C = (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
}), ew = W(Sd, fS, QC), tw = (e, t, n) => {
	switch (t) {
		case "top": return e.top;
		case "bottom": return n - e.bottom;
		default: return 0;
	}
}, nw = (e, t, n) => {
	switch (t) {
		case "left": return e.left;
		case "right": return n - e.right;
		default: return 0;
	}
}, rw = W(od, Sd, XC, JC, YC, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = QC(t, n);
		o ??= tw(t, r, e);
		var c = r === "top" && !i || r === "bottom" && i;
		a[n.id] = o - Number(c) * s.height, o += (c ? -1 : 1) * s.height;
	}), a;
}), iw = W(ad, Sd, ZC, JC, YC, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = $C(t, n);
		o ??= nw(t, r, e);
		var c = r === "left" && !i || r === "right" && i;
		a[n.id] = o - Number(c) * s.width, o += (c ? -1 : 1) * s.width;
	}), a;
}), aw = W([
	Sd,
	fS,
	(e, t) => {
		var n = fS(e, t);
		if (n != null) return rw(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: e.left,
			y: 0
		} : {
			x: e.left,
			y: i
		};
	}
}), ow = W([
	Sd,
	hS,
	(e, t) => {
		var n = hS(e, t);
		if (n != null) return iw(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: 0,
			y: e.top
		} : {
			x: i,
			y: e.top
		};
	}
}), sw = W(Sd, hS, (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
})), cw = (e, t, n, r) => {
	if (n != null) {
		var i = n.allowDuplicatedCategory, a = n.type, o = n.dataKey, s = Gu(e, r), c = t.map((e) => e.value), l = c.filter((e) => e != null);
		if (o && s && a === "category" && i && di(l)) return c;
	}
}, lw = W([
	mf,
	LS,
	vS,
	n_
], cw), uw = W([
	mf,
	yS,
	kC,
	KC,
	lw,
	GC,
	VC,
	jC,
	n_
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null) {
		var l = Gu(e, c);
		return {
			angle: t.angle,
			interval: t.interval,
			minTickGap: t.minTickGap,
			orientation: t.orientation,
			tick: t.tick,
			tickCount: t.tickCount,
			tickFormatter: t.tickFormatter,
			ticks: t.ticks,
			type: t.type,
			unit: t.unit,
			axisType: c,
			categoricalDomain: a,
			duplicateDomain: i,
			isCategorical: l,
			niceTicks: s,
			range: o,
			realScaleType: n,
			scale: r
		};
	}
}), dw = W([
	mf,
	bS,
	kC,
	KC,
	jC,
	VC,
	lw,
	GC,
	n_
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null && r != null) {
		var l = Gu(e, c), u = t.type, d = t.ticks, f = t.tickCount, p = n === "scaleBand" && typeof r.bandwidth == "function" ? r.bandwidth() / 2 : 2, m = u === "category" && r.bandwidth ? r.bandwidth() / p : 0;
		m = c === "angleAxis" && a != null && a.length >= 2 ? ii(a[0] - a[1]) * 2 * m : m;
		var h = d || i;
		return h ? h.map((e, t) => {
			var n = o ? o.indexOf(e) : e, i = r.map(n);
			return q(i) ? {
				index: t,
				coordinate: i + m,
				value: e,
				offset: m
			} : null;
		}).filter(gi) : l && s ? s.map((e, t) => {
			var n = r.map(e);
			return q(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(gi) : r.ticks ? r.ticks(f).map((e, t) => {
			var n = r.map(e);
			return q(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(gi) : r.domain().map((e, t) => {
			var n = r.map(e);
			return q(n) ? {
				coordinate: n + m,
				value: o ? o[e] : e,
				index: t,
				offset: m
			} : null;
		}).filter(gi);
	}
}), fw = W([
	mf,
	bS,
	KC,
	VC,
	lw,
	GC,
	n_
], (e, t, n, r, i, a, o) => {
	if (t != null && n != null && r != null && r[0] !== r[1]) {
		var s = Gu(e, o), c = t.tickCount, l = 0;
		return l = o === "angleAxis" && r?.length >= 2 ? ii(r[0] - r[1]) * 2 * l : l, s && a ? a.map((e, t) => {
			var r = n.map(e);
			return q(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(gi) : n.ticks ? n.ticks(c).map((e, t) => {
			var r = n.map(e);
			return q(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(gi) : n.domain().map((e, t) => {
			var r = n.map(e);
			return q(r) ? {
				coordinate: r + l,
				value: i ? i[e] : e,
				index: t,
				offset: l
			} : null;
		}).filter(gi);
	}
}), pw = W(vS, KC, (e, t) => {
	if (e != null && t != null) return $x($x({}, e), {}, { scale: t });
});
W((e, t, n) => _S(e, n), W([W([
	vS,
	kC,
	OC,
	HC
], Gx)], f_), (e, t) => {
	if (e != null && t != null) return $x($x({}, e), {}, { scale: t });
});
var mw = W([
	mf,
	ld,
	ud
], (e, t, n) => {
	switch (e) {
		case "horizontal": return t.some((e) => e.reversed) ? "right-to-left" : "left-to-right";
		case "vertical": return n.some((e) => e.reversed) ? "bottom-to-top" : "top-to-bottom";
		case "centric":
		case "radial": return "left-to-right";
		default: return;
	}
});
W([(e, t, n) => e.renderedTicks[t]?.[n]], (e) => {
	if (e && e.length !== 0) return (t) => {
		var n = Infinity, r = e[0];
		for (var i of e) {
			var a = Math.abs(i.coordinate - t);
			a < n && (n = a, r = i);
		}
		return r?.value;
	};
});
//#endregion
//#region node_modules/recharts/es6/state/selectors/selectTooltipEventType.js
var hw = (e) => e.options.defaultTooltipEventType, gw = (e) => e.options.validateTooltipEventTypes;
function _w(e, t, n) {
	if (e == null) return t;
	var r = e ? "axis" : "item";
	return n == null ? t : n.includes(r) ? r : t;
}
function vw(e, t) {
	return _w(t, hw(e), gw(e));
}
function yw(e) {
	return U((t) => vw(t, e));
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
var bw = (e, t) => {
	var n, r = Number(t);
	if (!(ai(r) || t == null)) return r >= 0 ? e == null || (n = e[r]) == null ? void 0 : n.value : void 0;
}, xw = (e) => e.tooltip.settings, Sw = {
	active: !1,
	index: null,
	dataKey: void 0,
	graphicalItemId: void 0,
	coordinate: void 0
}, Cw = Hl({
	name: "tooltip",
	initialState: {
		itemInteraction: {
			click: Sw,
			hover: Sw
		},
		axisInteraction: {
			click: Sw,
			hover: Sw
		},
		keyboardInteraction: Sw,
		syncInteraction: {
			active: !1,
			index: null,
			dataKey: void 0,
			label: void 0,
			coordinate: void 0,
			sourceViewBox: void 0,
			graphicalItemId: void 0
		},
		tooltipItemPayloads: [],
		settings: {
			shared: void 0,
			trigger: "hover",
			axisId: 0,
			active: !1,
			defaultIndex: void 0
		}
	},
	reducers: {
		addTooltipEntrySettings: {
			reducer(e, t) {
				e.tooltipItemPayloads.push(G(t.payload));
			},
			prepare: Dl()
		},
		replaceTooltipEntrySettings: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = pl(e).tooltipItemPayloads.indexOf(G(r));
				a > -1 && (e.tooltipItemPayloads[a] = G(i));
			},
			prepare: Dl()
		},
		removeTooltipEntrySettings: {
			reducer(e, t) {
				var n = pl(e).tooltipItemPayloads.indexOf(G(t.payload));
				n > -1 && e.tooltipItemPayloads.splice(n, 1);
			},
			prepare: Dl()
		},
		setTooltipSettingsState(e, t) {
			e.settings = t.payload;
		},
		setActiveMouseOverItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.itemInteraction.hover.active = !0, e.itemInteraction.hover.index = t.payload.activeIndex, e.itemInteraction.hover.dataKey = t.payload.activeDataKey, e.itemInteraction.hover.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		mouseLeaveChart(e) {
			e.itemInteraction.hover.active = !1, e.axisInteraction.hover.active = !1;
		},
		mouseLeaveItem(e) {
			e.itemInteraction.hover.active = !1;
		},
		setActiveClickItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.itemInteraction.click.active = !0, e.keyboardInteraction.active = !1, e.itemInteraction.click.index = t.payload.activeIndex, e.itemInteraction.click.dataKey = t.payload.activeDataKey, e.itemInteraction.click.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setMouseOverAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.axisInteraction.hover.active = !0, e.keyboardInteraction.active = !1, e.axisInteraction.hover.index = t.payload.activeIndex, e.axisInteraction.hover.dataKey = t.payload.activeDataKey, e.axisInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		setMouseClickAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.axisInteraction.click.active = !0, e.axisInteraction.click.index = t.payload.activeIndex, e.axisInteraction.click.dataKey = t.payload.activeDataKey, e.axisInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setSyncInteraction(e, t) {
			e.syncInteraction = t.payload;
		},
		setKeyboardInteraction(e, t) {
			e.keyboardInteraction.active = t.payload.active, e.keyboardInteraction.index = t.payload.activeIndex, e.keyboardInteraction.coordinate = t.payload.activeCoordinate;
		}
	}
}), ww = Cw.actions, Tw = ww.addTooltipEntrySettings, Ew = ww.replaceTooltipEntrySettings, Dw = ww.removeTooltipEntrySettings, Ow = ww.setTooltipSettingsState, kw = ww.setActiveMouseOverItemIndex;
ww.mouseLeaveItem;
var Aw = ww.mouseLeaveChart;
ww.setActiveClickItemIndex;
var jw = ww.setMouseOverAxisIndex, Mw = ww.setMouseClickAxisIndex, Nw = ww.setSyncInteraction, Pw = ww.setKeyboardInteraction, Fw = Cw.reducer;
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
function Iw(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Lw(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Iw(Object(n), !0).forEach(function(t) {
			Rw(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Iw(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Rw(e, t, n) {
	return (t = zw(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function zw(e) {
	var t = Bw(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Bw(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Vw(e, t, n) {
	return t === "axis" ? n === "click" ? e.axisInteraction.click : e.axisInteraction.hover : n === "click" ? e.itemInteraction.click : e.itemInteraction.hover;
}
function Hw(e) {
	return e.index != null;
}
var Uw = (e, t, n, r) => {
	if (t == null) return Sw;
	var i = Vw(e, t, n);
	if (i == null) return Sw;
	if (i.active) return i;
	if (e.keyboardInteraction.active) return e.keyboardInteraction;
	if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
	var a = e.settings.active === !0;
	if (Hw(i)) {
		if (a) return Lw(Lw({}, i), {}, { active: !0 });
	} else if (r != null) return {
		active: !0,
		coordinate: void 0,
		dataKey: void 0,
		index: r,
		graphicalItemId: void 0
	};
	return Lw(Lw({}, Sw), {}, { coordinate: i.coordinate });
};
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
function Ww(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
	if (e instanceof Date) {
		var t = e.valueOf();
		return Number.isFinite(t) ? t : void 0;
	}
	var n = Number(e);
	return Number.isFinite(n) ? n : void 0;
}
function Gw(e, t) {
	var n = Ww(e), r = t[0], i = t[1];
	return n !== void 0 && n >= Math.min(r, i) && n <= Math.max(r, i);
}
function Kw(e, t, n) {
	if (n == null || t == null) return !0;
	var r = Uu(e, t);
	return r == null || !lg(n) || Gw(r, n);
}
var qw = (e, t, n, r) => {
	var i = e?.index;
	if (i == null) return null;
	var a = Number(i);
	if (!q(a)) return i;
	var o = 0, s = Infinity;
	t.length > 0 && (s = t.length - 1);
	var c = Math.max(o, Math.min(a, s)), l = t[c];
	return l == null || Kw(l, n, r) ? String(c) : null;
}, Jw = (e, t, n, r, i, a, o) => {
	if (a != null) {
		var s = o[0]?.getPosition(a);
		if (s != null) return s;
		var c = i?.[Number(a)];
		if (c) switch (n) {
			case "horizontal": return {
				x: c.coordinate,
				y: (r.top + t) / 2
			};
			default: return {
				x: (r.left + e) / 2,
				y: c.coordinate
			};
		}
	}
}, Yw = (e, t, n, r) => {
	if (t === "axis") return e.tooltipItemPayloads;
	if (e.tooltipItemPayloads.length === 0) return [];
	var i = n === "hover" ? e.itemInteraction.hover.graphicalItemId : e.itemInteraction.click.graphicalItemId;
	if (e.syncInteraction.active && i == null) return e.tooltipItemPayloads;
	if (i == null && (r != null || e.keyboardInteraction.active)) {
		var a = e.tooltipItemPayloads[0];
		return a == null ? [] : [a];
	}
	return e.tooltipItemPayloads.filter((e) => e.settings?.graphicalItemId === i);
}, Xw = (e) => e.options.tooltipPayloadSearcher, Zw = (e) => e.tooltip;
//#endregion
//#region node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayload.js
function Qw(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function $w(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Qw(Object(n), !0).forEach(function(t) {
			eT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qw(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function eT(e, t, n) {
	return (t = tT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function tT(e) {
	var t = nT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function nT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function rT(e) {
	if (typeof e == "string" || typeof e == "number") return e;
}
function iT(e) {
	if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
}
function aT(e) {
	if (typeof e == "string" || typeof e == "number") return e;
	if (typeof e == "function") return (t) => e(t);
}
function oT(e) {
	if (typeof e == "string") return e;
}
function sT(e) {
	if (typeof e == "object" && e) return {
		name: "name" in e ? rT(e.name) : void 0,
		unit: "unit" in e ? iT(e.unit) : void 0,
		dataKey: "dataKey" in e ? aT(e.dataKey) : void 0,
		payload: "payload" in e ? e.payload : void 0,
		color: "color" in e ? oT(e.color) : void 0,
		fill: "fill" in e ? oT(e.fill) : void 0
	};
}
function cT(e, t) {
	return e ?? t;
}
var lT = (e, t, n, r, i, a, o) => {
	if (t != null && a != null) {
		var s = n.chartData, c = n.computedData, l = n.dataStartIndex, u = n.dataEndIndex;
		return e.reduce((e, n) => {
			var d = n.dataDefinedOnItem, f = n.settings, p = cT(d, s), m = Array.isArray(p) ? Iu(p, l, u) : p, h = f?.dataKey ?? r, g = f?.nameKey, _;
			return r && Array.isArray(m) && !Array.isArray(m[0]) && o === "axis" ? (_ = pi(m, r, i), _ ??= a(m, t, c, g)) : _ = a(m, t, c, g), Array.isArray(_) ? _.forEach((t) => {
				var n = sT(t), r = n?.name, i = n?.dataKey, a = n?.payload, o = $w($w({}, f), {}, {
					name: r,
					unit: n?.unit,
					color: n?.color ?? f?.color,
					fill: n?.fill ?? f?.fill
				});
				e.push(td({
					tooltipEntrySettings: o,
					dataKey: i,
					payload: a,
					value: Uu(a, i),
					name: r == null ? void 0 : String(r)
				}));
			}) : e.push(td({
				tooltipEntrySettings: f,
				dataKey: h,
				payload: _,
				value: Uu(_, h),
				name: Uu(_, g) ?? f?.name
			})), e;
		}, []);
	}
}, uT = W([
	GS,
	xS,
	jg
], Jx), dT = W([
	W([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [...e, ...t]),
	GS,
	W([u_, d_], SS)
], TS, { memoizeOptions: { resultEqualityCheck: c_ } }), fT = W([dT], (e) => e.filter(o_)), pT = W([dT], AS, { memoizeOptions: { resultEqualityCheck: c_ } }), mT = W([dT], (e) => e.some((e) => !e.data)), hT = W([pT, Qh], NS), gT = W([
	fT,
	Qh,
	GS
], a_), _T = W([
	hT,
	GS,
	dT,
	Qh,
	mT,
	pT
], IS), vT = W([GS], QS), yT = W([vT, W([GS], (e) => e.allowDataOverflow)], dg), bT = W([
	W([
		gT,
		W([dT], (e) => e.filter(o_)),
		kg,
		Ag
	], JS),
	Qh,
	u_,
	yT
], XS), xT = W([
	hT,
	GS,
	W([dT], OS),
	nC,
	u_,
	ng
], aC, { memoizeOptions: { resultEqualityCheck: s_ } }), ST = W([W([
	lC,
	u_,
	d_
], uC), u_], gC), CT = W([W([
	fC,
	u_,
	d_
], uC), u_], vC), wT = W([
	GS,
	mf,
	hT,
	_T,
	kg,
	u_,
	W([
		GS,
		vT,
		yT,
		bT,
		xT,
		W([
			ST,
			W([W([
				mC,
				u_,
				d_
			], uC), u_], SC),
			CT
		], iC),
		mf,
		u_
	], wC)
], DC), TT = W([
	GS,
	wT,
	W([
		wT,
		GS,
		uT
	], AC),
	u_
], MC), ET = (e) => VC(e, u_(e), d_(e), !1), DT = W([GS, ET], Rg), OT = W([W([
	GS,
	uT,
	TT,
	DT
], Gx)], f_), kT = W([
	mf,
	GS,
	uT,
	OT,
	ET,
	W([
		mf,
		_T,
		GS,
		u_
	], cw),
	W([
		mf,
		_T,
		GS,
		u_
	], WC),
	u_
], (e, t, n, r, i, a, o, s) => {
	if (t) {
		var c = t.type, l = Gu(e, s);
		if (r) {
			var u = n === "scaleBand" && r.bandwidth ? r.bandwidth() / 2 : 2, d = c === "category" && r.bandwidth ? r.bandwidth() / u : 0;
			return d = s === "angleAxis" && i != null && i?.length >= 2 ? ii(i[0] - i[1]) * 2 * d : d, l && o ? o.map((e, t) => {
				var n = r.map(e);
				return q(n) ? {
					coordinate: n + d,
					value: e,
					index: t,
					offset: d
				} : null;
			}).filter(gi) : r.domain().map((e, t) => {
				var n = r.map(e);
				return q(n) ? {
					coordinate: n + d,
					value: a ? a[e] : e,
					index: t,
					offset: d
				} : null;
			}).filter(gi);
		}
	}
}), AT = W([
	hw,
	gw,
	xw
], (e, t, n) => _w(n.shared, e, t)), jT = (e) => e.tooltip.settings.trigger, MT = (e) => e.tooltip.settings.defaultIndex, NT = W([
	Zw,
	AT,
	jT,
	MT
], Uw), PT = W([
	NT,
	hT,
	KS,
	wT
], qw), FT = W([kT, PT], bw), IT = W([NT], (e) => {
	if (e) return e.dataKey;
}), LT = W([NT], (e) => {
	if (e) return e.graphicalItemId;
}), RT = W([
	Zw,
	AT,
	jT,
	MT
], Yw), zT = W([NT, W([
	ad,
	od,
	mf,
	Sd,
	kT,
	MT,
	RT
], Jw)], (e, t) => e != null && e.coordinate ? e.coordinate : t), BT = W([NT], (e) => e?.active ?? !1), VT = W([W([
	RT,
	PT,
	Qh,
	KS,
	FT,
	Xw,
	AT
], lT)], (e) => {
	if (e != null) {
		var t = e.map((e) => e.payload).filter((e) => e != null);
		return Array.from(new Set(t));
	}
});
//#endregion
//#region node_modules/recharts/es6/context/useTooltipAxis.js
function HT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function UT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? HT(Object(n), !0).forEach(function(t) {
			WT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : HT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function WT(e, t, n) {
	return (t = GT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function GT(e) {
	var t = KT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function KT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var qT = () => U(GS), JT = () => {
	var e = qT(), t = U(kT), n = U(OT);
	return ed(!e || !n ? void 0 : UT(UT({}, e), {}, { scale: n }), t);
};
//#endregion
//#region node_modules/recharts/es6/util/getActiveCoordinate.js
function YT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function XT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? YT(Object(n), !0).forEach(function(t) {
			ZT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : YT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ZT(e, t, n) {
	return (t = QT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function QT(e) {
	var t = $T(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function $T(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var eE = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "horizontal") return {
			x: i.coordinate,
			y: r.relativeY
		};
		if (e === "vertical") return {
			x: r.relativeX,
			y: i.coordinate
		};
	}
	return {
		x: 0,
		y: 0
	};
}, tE = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "centric") {
			var a = i.coordinate, o = r.radius;
			return XT(XT(XT({}, r), Th(r.cx, r.cy, o, a)), {}, {
				angle: a,
				radius: o
			});
		}
		var s = i.coordinate, c = r.angle;
		return XT(XT(XT({}, r), Th(r.cx, r.cy, s, c)), {}, {
			angle: c,
			radius: s
		});
	}
	return {
		angle: 0,
		clockWise: !1,
		cx: 0,
		cy: 0,
		endAngle: 0,
		innerRadius: 0,
		outerRadius: 0,
		radius: 0,
		startAngle: 0,
		x: 0,
		y: 0
	};
};
function nE(e, t) {
	var n = e.relativeX, r = e.relativeY;
	return n >= t.left && n <= t.left + t.width && r >= t.top && r <= t.top + t.height;
}
var rE = (e, t, n, r, i) => {
	var a = t?.length ?? 0;
	if (a <= 1 || e == null) return 0;
	if (r === "angleAxis" && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6) for (var o = i[1] - i[0], s = (t, n, r) => [
		e,
		e + o,
		e - o
	].some((e) => (r ? e >= t : e > t) && e <= n), c = 0; c < a; c++) {
		var l = c > 0 ? n[c - 1]?.coordinate : n[a - 1]?.coordinate, u = n[c]?.coordinate, d = c >= a - 1 ? n[0]?.coordinate : n[c + 1]?.coordinate, f = void 0;
		if (l != null && u != null && d != null) {
			if (ii(u - l) !== ii(d - u)) {
				var p = [];
				if (ii(d - u) === ii(i[1] - i[0])) {
					f = d;
					var m = u + i[1] - i[0];
					p[0] = Math.min(m, (m + l) / 2), p[1] = Math.max(m, (m + l) / 2);
				} else {
					f = l;
					var h = d + i[1] - i[0];
					p[0] = Math.min(u, (h + u) / 2), p[1] = Math.max(u, (h + u) / 2);
				}
				var g = [Math.min(u, (f + u) / 2), Math.max(u, (f + u) / 2)];
				if (s(g[0], g[1], !1) || s(p[0], p[1], !0)) return n[c]?.index;
			} else {
				var _ = Math.min(l, d), v = Math.max(l, d);
				if (s((_ + u) / 2, (v + u) / 2, !1)) return n[c]?.index;
			}
		}
	}
	else if (t) for (var y = 0; y < a; y++) {
		var b = t[y];
		if (b != null) {
			var x = t[y + 1], S = t[y - 1];
			if (y === 0 && x != null && e <= (b.coordinate + x.coordinate) / 2 || y === a - 1 && S != null && e > (b.coordinate + S.coordinate) / 2 || y > 0 && y < a - 1 && S != null && x != null && e > (b.coordinate + S.coordinate) / 2 && e <= (b.coordinate + x.coordinate) / 2) return b.index;
		}
	}
	return -1;
}, iE = () => U(jg), aE = (e, t) => t, oE = (e, t, n) => n, sE = (e, t, n, r) => r, cE = W(kT, (e) => ws(e, (e) => e.coordinate)), lE = W([
	Zw,
	aE,
	oE,
	sE
], Uw), uE = W([
	lE,
	hT,
	KS,
	wT
], qw), dE = (e, t, n) => {
	if (t != null) {
		var r = Zw(e);
		return t === "axis" ? n === "hover" ? r.axisInteraction.hover.dataKey : r.axisInteraction.click.dataKey : n === "hover" ? r.itemInteraction.hover.dataKey : r.itemInteraction.click.dataKey;
	}
}, fE = W([
	Zw,
	aE,
	oE,
	sE
], Yw), pE = W([
	ad,
	od,
	mf,
	Sd,
	kT,
	sE,
	fE
], Jw), mE = W([lE, pE], (e, t) => e.coordinate ?? t), hE = W([kT, uE], bw), gE = W([
	fE,
	uE,
	Qh,
	KS,
	hE,
	Xw,
	aE
], lT), _E = W([lE, uE], (e, t) => ({
	isActive: e.active && t != null,
	activeIndex: t
})), vE = (e, t, n, r, i, a, o) => {
	if (e && n && r && i && nE(e, o)) {
		var s = rE(rd(e, t), a, i, n, r), c = eE(t, i, s, e);
		return {
			activeIndex: String(s),
			activeCoordinate: c
		};
	}
}, yE = (e, t, n, r, i, a, o) => {
	if (e && r && i && a && n) {
		var s = jh(e, n);
		if (s) {
			var c = rE(id(s, t), o, a, r, i), l = tE(t, a, c, s);
			return {
				activeIndex: String(c),
				activeCoordinate: l
			};
		}
	}
}, bE = (e, t, n, r, i, a, o, s) => {
	if (e && t && r && i && a) return t === "horizontal" || t === "vertical" ? vE(e, t, r, i, a, o, s) : yE(e, t, n, r, i, a, o);
}, xE = W((e) => e.zIndex.zIndexMap, (e, t) => t, (e, t, n) => n, (e, t, n) => {
	if (t != null) {
		var r = e[t];
		if (r != null) return n ? r.panoramaElement : r.element;
	}
}), SE = W((e) => e.zIndex.zIndexMap, (e) => {
	var t = Object.keys(e).map((e) => parseInt(e, 10)).concat(Object.values(Fg));
	return Array.from(new Set(t)).sort((e, t) => e - t);
}, { memoizeOptions: { resultEqualityCheck: l_ } });
//#endregion
//#region node_modules/recharts/es6/state/zIndexSlice.js
function CE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function wE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? CE(Object(n), !0).forEach(function(t) {
			TE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : CE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function TE(e, t, n) {
	return (t = EE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function EE(e) {
	var t = DE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function DE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var OE = { zIndexMap: Object.values(Fg).reduce((e, t) => wE(wE({}, e), {}, { [t]: {
	element: void 0,
	panoramaElement: void 0,
	consumers: 0
} }), {}) }, kE = new Set(Object.values(Fg));
function AE(e) {
	return kE.has(e);
}
var jE = Hl({
	name: "zIndex",
	initialState: OE,
	reducers: {
		registerZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] ? e.zIndexMap[n].consumers += 1 : e.zIndexMap[n] = {
					consumers: 1,
					element: void 0,
					panoramaElement: void 0
				};
			},
			prepare: Dl()
		},
		unregisterZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (--e.zIndexMap[n].consumers, e.zIndexMap[n].consumers <= 0 && !AE(n) && delete e.zIndexMap[n]);
			},
			prepare: Dl()
		},
		registerZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload, r = n.zIndex, i = n.element, a = n.isPanorama;
				e.zIndexMap[r] ? a ? e.zIndexMap[r].panoramaElement = G(i) : e.zIndexMap[r].element = G(i) : e.zIndexMap[r] = {
					consumers: 0,
					element: a ? void 0 : G(i),
					panoramaElement: a ? G(i) : void 0
				};
			},
			prepare: Dl()
		},
		unregisterZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (t.payload.isPanorama ? e.zIndexMap[n].panoramaElement = void 0 : e.zIndexMap[n].element = void 0);
			},
			prepare: Dl()
		}
	}
}), ME = jE.actions, NE = ME.registerZIndexPortal, PE = ME.unregisterZIndexPortal, FE = ME.registerZIndexPortalElement, IE = ME.unregisterZIndexPortalElement, LE = jE.reducer, RE = g();
function zE(e) {
	var t = e.zIndex, n = e.children, r = _f() && t !== void 0 && t !== 0, i = Ed(), a = (0, y.useRef)(void 0), o = (0, y.useRef)(/* @__PURE__ */ new Set()), s = $o(), c = U((e) => xE(e, t, i));
	if ((0, y.useLayoutEffect)(() => {
		if (!r) {
			var e = o.current;
			e.forEach((e) => {
				s(PE({ zIndex: e }));
			}), e.clear(), a.current = void 0;
		} else if (o.current.has(t) || (s(NE({ zIndex: t })), o.current.add(t)), c) {
			a.current = c;
			var n = o.current;
			n.forEach((e) => {
				e !== t && (s(PE({ zIndex: e })), n.delete(e));
			});
		}
	}, [
		s,
		t,
		r,
		c
	]), (0, y.useLayoutEffect)(() => {
		var e = o.current;
		return () => {
			e.forEach((e) => {
				s(PE({ zIndex: e }));
			}), e.clear();
		};
	}, [s]), !r) return n;
	var l = c ?? a.current;
	return l ? /*#__PURE__*/ (0, RE.createPortal)(n, l) : null;
}
//#endregion
//#region node_modules/recharts/es6/component/Cursor.js
function BE() {
	return BE = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, BE.apply(null, arguments);
}
function VE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function HE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? VE(Object(n), !0).forEach(function(t) {
			UE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : VE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function UE(e, t, n) {
	return (t = WE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function WE(e) {
	var t = GE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function GE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function KE(e) {
	var t = e.cursor, n = e.cursorComp, r = e.cursorProps;
	return /*#__PURE__*/ (0, y.isValidElement)(t) ? /*#__PURE__*/ (0, y.cloneElement)(t, r) : /*#__PURE__*/ (0, y.createElement)(n, r);
}
function qE(e) {
	var t = e.coordinate, n = e.payload, r = e.index, i = e.offset, a = e.tooltipAxisBandSize, o = e.layout, s = e.cursor, c = e.tooltipEventType, l = e.chartName, u = t, d = n, f = r;
	if (!s || !u || l !== "ScatterChart" && c !== "axis") return null;
	var p, m, h;
	if (l === "ScatterChart") p = u, m = im, h = Fg.cursorLine;
	else if (l === "BarChart") p = am(o, u, i, a), m = _h, h = Fg.cursorRectangle;
	else if (o === "radial" && Ea(u)) {
		var g = Mh(u), _ = g.cx, v = g.cy, b = g.radius;
		p = {
			cx: _,
			cy: v,
			startAngle: g.startAngle,
			endAngle: g.endAngle,
			innerRadius: b,
			outerRadius: b
		}, m = qh, h = Fg.cursorLine;
	} else p = { points: Jh(o, u, i) }, m = qp, h = Fg.cursorLine;
	var x = typeof s == "object" && "className" in s ? s.className : void 0, S = HE(HE(HE(HE({
		stroke: "#ccc",
		pointerEvents: "none"
	}, i), p), Mr(s)), {}, {
		payload: d,
		payloadIndex: f,
		className: Tr("recharts-tooltip-cursor", x)
	});
	return /*#__PURE__*/ y.createElement(zE, { zIndex: e.zIndex ?? h }, /*#__PURE__*/ y.createElement(KE, {
		cursor: s,
		cursorComp: m,
		cursorProps: S
	}));
}
function JE(e) {
	var t = JT(), n = df(), r = X(), i = iE();
	return t == null || n == null || r == null || i == null ? null : /*#__PURE__*/ y.createElement(qE, BE({}, e, {
		offset: n,
		layout: r,
		tooltipAxisBandSize: t,
		chartName: i
	}));
}
//#endregion
//#region node_modules/recharts/es6/context/tooltipPortalContext.js
var YE = /*#__PURE__*/ (0, y.createContext)(null), XE = () => (0, y.useContext)(YE), ZE = (/* @__PURE__ */ u((/* @__PURE__ */ s(((e, t) => {
	var n = Object.prototype.hasOwnProperty, r = "~";
	function i() {}
	Object.create && (i.prototype = Object.create(null), new i().__proto__ || (r = !1));
	function a(e, t, n) {
		this.fn = e, this.context = t, this.once = n || !1;
	}
	function o(e, t, n, i, o) {
		if (typeof n != "function") throw TypeError("The listener must be a function");
		var s = new a(n, i || e, o), c = r ? r + t : t;
		return e._events[c] ? e._events[c].fn ? e._events[c] = [e._events[c], s] : e._events[c].push(s) : (e._events[c] = s, e._eventsCount++), e;
	}
	function s(e, t) {
		--e._eventsCount === 0 ? e._events = new i() : delete e._events[t];
	}
	function c() {
		this._events = new i(), this._eventsCount = 0;
	}
	c.prototype.eventNames = function() {
		var e = [], t, i;
		if (this._eventsCount === 0) return e;
		for (i in t = this._events) n.call(t, i) && e.push(r ? i.slice(1) : i);
		return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
	}, c.prototype.listeners = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		if (!n) return [];
		if (n.fn) return [n.fn];
		for (var i = 0, a = n.length, o = Array(a); i < a; i++) o[i] = n[i].fn;
		return o;
	}, c.prototype.listenerCount = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		return n ? n.fn ? 1 : n.length : 0;
	}, c.prototype.emit = function(e, t, n, i, a, o) {
		var s = r ? r + e : e;
		if (!this._events[s]) return !1;
		var c = this._events[s], l = arguments.length, u, d;
		if (c.fn) {
			switch (c.once && this.removeListener(e, c.fn, void 0, !0), l) {
				case 1: return c.fn.call(c.context), !0;
				case 2: return c.fn.call(c.context, t), !0;
				case 3: return c.fn.call(c.context, t, n), !0;
				case 4: return c.fn.call(c.context, t, n, i), !0;
				case 5: return c.fn.call(c.context, t, n, i, a), !0;
				case 6: return c.fn.call(c.context, t, n, i, a, o), !0;
			}
			for (d = 1, u = Array(l - 1); d < l; d++) u[d - 1] = arguments[d];
			c.fn.apply(c.context, u);
		} else {
			var f = c.length, p;
			for (d = 0; d < f; d++) switch (c[d].once && this.removeListener(e, c[d].fn, void 0, !0), l) {
				case 1:
					c[d].fn.call(c[d].context);
					break;
				case 2:
					c[d].fn.call(c[d].context, t);
					break;
				case 3:
					c[d].fn.call(c[d].context, t, n);
					break;
				case 4:
					c[d].fn.call(c[d].context, t, n, i);
					break;
				default:
					if (!u) for (p = 1, u = Array(l - 1); p < l; p++) u[p - 1] = arguments[p];
					c[d].fn.apply(c[d].context, u);
			}
		}
		return !0;
	}, c.prototype.on = function(e, t, n) {
		return o(this, e, t, n, !1);
	}, c.prototype.once = function(e, t, n) {
		return o(this, e, t, n, !0);
	}, c.prototype.removeListener = function(e, t, n, i) {
		var a = r ? r + e : e;
		if (!this._events[a]) return this;
		if (!t) return s(this, a), this;
		var o = this._events[a];
		if (o.fn) o.fn === t && (!i || o.once) && (!n || o.context === n) && s(this, a);
		else {
			for (var c = 0, l = [], u = o.length; c < u; c++) (o[c].fn !== t || i && !o[c].once || n && o[c].context !== n) && l.push(o[c]);
			l.length ? this._events[a] = l.length === 1 ? l[0] : l : s(this, a);
		}
		return this;
	}, c.prototype.removeAllListeners = function(e) {
		var t;
		return e ? (t = r ? r + e : e, this._events[t] && s(this, t)) : (this._events = new i(), this._eventsCount = 0), this;
	}, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = r, c.EventEmitter = c, t !== void 0 && (t.exports = c);
})))(), 1)).default, QE = new ZE(), $E = "recharts.syncEvent.tooltip", eD = "recharts.syncEvent.brush", tD = (e, t) => {
	if (t && Array.isArray(e)) {
		var n = Number.parseInt(t, 10);
		if (!ai(n)) return e[n];
	}
}, nD = Hl({
	name: "options",
	initialState: {
		chartName: "",
		tooltipPayloadSearcher: () => void 0,
		eventEmitter: void 0,
		defaultTooltipEventType: "axis"
	},
	reducers: { createEventEmitter: (e) => {
		e.eventEmitter ??= Symbol("rechartsEventEmitter");
	} }
}), rD = nD.reducer, iD = nD.actions.createEventEmitter;
//#endregion
//#region node_modules/recharts/es6/synchronisation/syncSelectors.js
function aD(e) {
	return e.tooltip.syncInteraction;
}
var oD = Hl({
	name: "chartData",
	initialState: {
		chartData: void 0,
		computedData: void 0,
		dataStartIndex: 0,
		dataEndIndex: 0
	},
	reducers: {
		setChartData(e, t) {
			e.chartData = G(t.payload), t.payload == null ? (e.dataStartIndex = 0, e.dataEndIndex = 0) : t.payload.length > 0 && e.dataEndIndex !== t.payload.length - 1 && (e.dataEndIndex = t.payload.length - 1);
		},
		setComputedData(e, t) {
			e.computedData = t.payload;
		},
		setDataStartEndIndexes(e, t) {
			var n = t.payload, r = n.startIndex, i = n.endIndex;
			r != null && (e.dataStartIndex = r), i != null && (e.dataEndIndex = i);
		}
	}
}), sD = oD.actions, cD = sD.setChartData, lD = sD.setDataStartEndIndexes;
sD.setComputedData;
var uD = oD.reducer, dD = ["x", "y"];
function fD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fD(Object(n), !0).forEach(function(t) {
			mD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function mD(e, t, n) {
	return (t = hD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hD(e) {
	var t = gD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function _D(e, t) {
	if (e == null) return {};
	var n, r, i = vD(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function vD(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function yD() {
	var e = U(Mg), t = U(Pg), n = $o(), r = U(Ng), i = U(kT), a = X(), o = lf(), s = U((e) => e.rootProps.className);
	(0, y.useEffect)(() => {
		if (e == null) return _i;
		var s = (s, c, l) => {
			if (t !== l && e === s) {
				if (c.payload.active === !1) n(Nw({
					active: !1,
					coordinate: void 0,
					dataKey: void 0,
					index: null,
					label: void 0,
					sourceViewBox: void 0,
					graphicalItemId: void 0
				}));
				else if (r === "index") {
					var u;
					if (o && c != null && (u = c.payload) != null && u.coordinate && c.payload.sourceViewBox) {
						var d = c.payload.coordinate, f = d.x, p = d.y, m = _D(d, dD), h = c.payload.sourceViewBox, g = h.x, _ = h.y, v = h.width, y = h.height, b = pD(pD({}, m), {}, {
							x: o.x + (v ? (f - g) / v : 0) * o.width,
							y: o.y + (y ? (p - _) / y : 0) * o.height
						});
						n(pD(pD({}, c), {}, { payload: pD(pD({}, c.payload), {}, { coordinate: b }) }));
					} else n(c);
				} else if (i != null) {
					var x;
					typeof r == "function" ? x = i[r(i, {
						activeTooltipIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						isTooltipActive: c.payload.active,
						activeIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						activeLabel: c.payload.label,
						activeDataKey: c.payload.dataKey,
						activeCoordinate: c.payload.coordinate
					})] : r === "value" && (x = i.find((e) => String(e.value) === c.payload.label));
					var S = c.payload.coordinate;
					if (S == null || o == null) n(Nw({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: void 0,
						graphicalItemId: void 0
					}));
					else if (x == null) n(Nw({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: c.payload.sourceViewBox,
						graphicalItemId: void 0
					}));
					else {
						var C = S.x, w = S.y, T = Math.min(C, o.x + o.width), E = Math.min(w, o.y + o.height), D = {
							x: a === "horizontal" ? x.coordinate : T,
							y: a === "horizontal" ? E : x.coordinate
						};
						n(Nw({
							active: c.payload.active,
							coordinate: D,
							dataKey: c.payload.dataKey,
							index: String(x.index),
							label: c.payload.label,
							sourceViewBox: c.payload.sourceViewBox,
							graphicalItemId: c.payload.graphicalItemId
						}));
					}
				}
			}
		};
		return QE.on($E, s), () => {
			QE.off($E, s);
		};
	}, [
		s,
		n,
		t,
		e,
		r,
		i,
		a,
		o
	]);
}
function bD() {
	var e = U(Mg), t = U(Pg), n = $o();
	(0, y.useEffect)(() => {
		if (e == null) return _i;
		var r = (r, i, a) => {
			t !== a && e === r && n(lD(i));
		};
		return QE.on(eD, r), () => {
			QE.off(eD, r);
		};
	}, [
		n,
		t,
		e
	]);
}
function xD() {
	var e = $o();
	(0, y.useEffect)(() => {
		e(iD());
	}, [e]), yD(), bD();
}
function SD(e, t, n, r, i, a) {
	var o = U((n) => dE(n, e, t)), s = U(LT), c = U(Pg), l = U(Mg), u = U(Ng), d = U(aD)?.sourceViewBox != null, f = lf();
	(0, y.useEffect)(() => {
		if (!d && l != null && c != null) {
			var e = Nw({
				active: a,
				coordinate: n,
				dataKey: o,
				index: i,
				label: typeof r == "number" ? String(r) : r,
				sourceViewBox: f,
				graphicalItemId: s
			});
			QE.emit($E, l, e, c);
		}
	}, [
		d,
		n,
		o,
		s,
		i,
		r,
		c,
		l,
		u,
		a,
		f
	]);
}
//#endregion
//#region node_modules/recharts/es6/component/Tooltip.js
function CD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function wD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? CD(Object(n), !0).forEach(function(t) {
			TD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : CD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function TD(e, t, n) {
	return (t = ED(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ED(e) {
	var t = DD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function DD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function OD(e, t) {
	return ND(e) || MD(e, t) || AD(e, t) || kD();
}
function kD() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function AD(e, t) {
	if (e) {
		if (typeof e == "string") return jD(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jD(e, t) : void 0;
	}
}
function jD(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function MD(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ND(e) {
	if (Array.isArray(e)) return e;
}
function PD(e) {
	return e.dataKey;
}
function FD(e, t) {
	return /*#__PURE__*/ y.isValidElement(e) ? /*#__PURE__*/ y.cloneElement(e, t) : typeof e == "function" ? /*#__PURE__*/ y.createElement(e, t) : /*#__PURE__*/ y.createElement(rp, t);
}
var ID = [], LD = {
	allowEscapeViewBox: {
		x: !1,
		y: !1
	},
	animationDuration: 400,
	animationEasing: "ease",
	axisId: 0,
	contentStyle: {},
	cursor: !0,
	filterNull: !0,
	includeHidden: !1,
	isAnimationActive: "auto",
	itemSorter: "name",
	itemStyle: {},
	labelStyle: {},
	offset: 10,
	reverseDirection: {
		x: !1,
		y: !1
	},
	separator: " : ",
	trigger: "hover",
	useTranslate3d: !1,
	wrapperStyle: {}
};
function RD(e) {
	var t = Fa(e, LD), n = t.active, r = t.allowEscapeViewBox, i = t.animationDuration, a = t.animationEasing, o = t.content, s = t.filterNull, c = t.isAnimationActive, l = t.offset, u = t.payloadUniqBy, d = t.position, f = t.reverseDirection, p = t.useTranslate3d, m = t.wrapperStyle, h = t.cursor, g = t.shared, _ = t.trigger, v = t.defaultIndex, b = t.portal, x = t.axisId, S = $o(), C = typeof v == "number" ? String(v) : v;
	(0, y.useEffect)(() => {
		S(Ow({
			shared: g,
			trigger: _,
			axisId: x,
			active: n,
			defaultIndex: C
		}));
	}, [
		S,
		g,
		_,
		x,
		n,
		C
	]);
	var w = lf(), T = Mp(), E = yw(g), D = U((e) => _E(e, E, _, C)) ?? {}, O = D.activeIndex, k = D.isActive, A = U((e) => gE(e, E, _, C)), j = U((e) => hE(e, E, _, C)), M = U((e) => mE(e, E, _, C)), N = A, ee = XE(), te = n ?? k ?? !1, ne = OD(Is([N, te]), 2), re = ne[0], ie = ne[1], ae = E === "axis" ? j : void 0;
	SD(E, _, M, ae, O, te);
	var oe = b ?? ee;
	if (oe == null || w == null || E == null) return null;
	var P = N ?? ID;
	te || (P = ID), s && P.length && (P = Go(P.filter((e) => e.value != null && (e.hide !== !0 || t.includeHidden)), u, PD));
	var se = P.length > 0, ce = wD(wD({}, t), {}, {
		payload: P,
		label: ae,
		active: te,
		activeIndex: O,
		coordinate: M,
		accessibilityLayer: T
	}), le = /*#__PURE__*/ y.createElement(jp, {
		allowEscapeViewBox: r,
		animationDuration: i,
		animationEasing: a,
		isAnimationActive: c,
		active: te,
		coordinate: M,
		hasPayload: se,
		offset: l,
		position: d,
		reverseDirection: f,
		useTranslate3d: p,
		viewBox: w,
		wrapperStyle: m,
		lastBoundingBox: re,
		innerRef: ie,
		hasPortalFromProps: !!b
	}, FD(o, ce));
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ (0, RE.createPortal)(le, oe), te && /*#__PURE__*/ y.createElement(JE, {
		cursor: h,
		tooltipEventType: E,
		coordinate: M,
		payload: P,
		index: O
	}));
}
//#endregion
//#region node_modules/recharts/es6/util/LRUCache.js
function zD(e, t, n) {
	return (t = BD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function BD(e) {
	var t = VD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function VD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var HD = class {
	constructor(e) {
		zD(this, "cache", /* @__PURE__ */ new Map()), this.maxSize = e;
	}
	get(e) {
		var t = this.cache.get(e);
		return t !== void 0 && (this.cache.delete(e), this.cache.set(e, t)), t;
	}
	set(e, t) {
		if (this.cache.has(e)) this.cache.delete(e);
		else if (this.cache.size >= this.maxSize) {
			var n = this.cache.keys().next().value;
			n != null && this.cache.delete(n);
		}
		this.cache.set(e, t);
	}
	clear() {
		this.cache.clear();
	}
	size() {
		return this.cache.size;
	}
};
//#endregion
//#region node_modules/recharts/es6/util/DOMUtils.js
function UD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function WD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? UD(Object(n), !0).forEach(function(t) {
			GD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : UD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function GD(e, t, n) {
	return (t = KD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function KD(e) {
	var t = qD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function qD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var JD = WD({}, {
	cacheSize: 2e3,
	enableCache: !0
}), YD = new HD(JD.cacheSize), XD = {
	position: "absolute",
	top: "-20000px",
	left: 0,
	padding: 0,
	margin: 0,
	border: "none",
	whiteSpace: "pre"
}, ZD = "recharts_measurement_span";
function QD(e, t) {
	return `${e}|${t.fontSize || ""}|${t.fontFamily || ""}|${t.fontWeight || ""}|${t.fontStyle || ""}|${t.letterSpacing || ""}|${t.textTransform || ""}`;
}
var $D = (e, t) => {
	try {
		var n = document.getElementById(ZD);
		n || (n = document.createElement("span"), n.setAttribute("id", ZD), n.setAttribute("aria-hidden", "true"), document.body.appendChild(n)), Object.assign(n.style, XD, t), n.textContent = `${e}`;
		var r = n.getBoundingClientRect();
		return {
			width: r.width,
			height: r.height
		};
	} catch {
		return {
			width: 0,
			height: 0
		};
	}
}, eO = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	if (e == null || up.isSsr) return {
		width: 0,
		height: 0
	};
	if (!JD.enableCache) return $D(e, t);
	var n = QD(e, t), r = YD.get(n);
	if (r) return r;
	var i = $D(e, t);
	return YD.set(n, i), i;
}, tO;
function nO(e, t) {
	return sO(e) || oO(e, t) || iO(e, t) || rO();
}
function rO() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function iO(e, t) {
	if (e) {
		if (typeof e == "string") return aO(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? aO(e, t) : void 0;
	}
}
function aO(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function oO(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function sO(e) {
	if (Array.isArray(e)) return e;
}
function cO(e, t, n) {
	return (t = lO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function lO(e) {
	var t = uO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function uO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var dO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, fO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, pO = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/, mO = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/, hO = {
	cm: 96 / 2.54,
	mm: 96 / 25.4,
	pt: 96 / 72,
	pc: 16,
	in: 96,
	Q: 96 / 101.6,
	px: 1
}, gO = [
	"cm",
	"mm",
	"pt",
	"pc",
	"in",
	"Q",
	"px"
];
function _O(e) {
	return gO.includes(e);
}
var vO = "NaN";
function yO(e, t) {
	return e * hO[t];
}
var bO = class e {
	static parse(t) {
		var n = nO(mO.exec(t) ?? [], 3), r = n[1], i = n[2];
		return r == null ? e.NaN : new e(parseFloat(r), i ?? "");
	}
	constructor(e, t) {
		this.num = e, this.unit = t, this.num = e, this.unit = t, ai(e) && (this.unit = ""), t !== "" && !pO.test(t) && (this.num = NaN, this.unit = ""), _O(t) && (this.num = yO(e, t), this.unit = "px");
	}
	add(t) {
		return this.unit === t.unit ? new e(this.num + t.num, this.unit) : new e(NaN, "");
	}
	subtract(t) {
		return this.unit === t.unit ? new e(this.num - t.num, this.unit) : new e(NaN, "");
	}
	multiply(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num * t.num, this.unit || t.unit);
	}
	divide(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num / t.num, this.unit || t.unit);
	}
	toString() {
		return `${this.num}${this.unit}`;
	}
	isNaN() {
		return ai(this.num);
	}
};
tO = bO, cO(bO, "NaN", new tO(NaN, ""));
function xO(e) {
	if (e == null || e.includes(vO)) return vO;
	for (var t = e; t.includes("*") || t.includes("/");) {
		var n = nO(dO.exec(t) ?? [], 4), r = n[1], i = n[2], a = n[3], o = bO.parse(r ?? ""), s = bO.parse(a ?? ""), c = i === "*" ? o.multiply(s) : o.divide(s);
		if (c.isNaN()) return vO;
		t = t.replace(dO, c.toString());
	}
	for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t);) {
		var l = nO(fO.exec(t) ?? [], 4), u = l[1], d = l[2], f = l[3], p = bO.parse(u ?? ""), m = bO.parse(f ?? ""), h = d === "+" ? p.add(m) : p.subtract(m);
		if (h.isNaN()) return vO;
		t = t.replace(fO, h.toString());
	}
	return t;
}
var SO = /\(([^()]*)\)/;
function CO(e) {
	for (var t = e, n; (n = SO.exec(t)) != null;) {
		var r = nO(n, 2)[1];
		t = t.replace(SO, xO(r));
	}
	return t;
}
function wO(e) {
	var t = e.replace(/\s+/g, "");
	return t = CO(t), t = xO(t), t;
}
function TO(e) {
	try {
		return wO(e);
	} catch {
		return vO;
	}
}
function EO(e) {
	var t = TO(e.slice(5, -1));
	return t === vO ? "" : t;
}
//#endregion
//#region node_modules/recharts/es6/component/Text.js
var DO = [
	"x",
	"y",
	"lineHeight",
	"capHeight",
	"fill",
	"scaleToFit",
	"textAnchor",
	"verticalAnchor"
], OO = [
	"dx",
	"dy",
	"angle",
	"className",
	"breakAll"
];
function kO() {
	return kO = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, kO.apply(null, arguments);
}
function AO(e, t) {
	if (e == null) return {};
	var n, r, i = jO(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function jO(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function MO(e, t) {
	return LO(e) || IO(e, t) || PO(e, t) || NO();
}
function NO() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function PO(e, t) {
	if (e) {
		if (typeof e == "string") return FO(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? FO(e, t) : void 0;
	}
}
function FO(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function IO(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function LO(e) {
	if (Array.isArray(e)) return e;
}
var RO = /[ \f\n\r\t\v\u2028\u2029]+/, zO = (e) => {
	var t = e.children, n = e.breakAll, r = e.style;
	try {
		var i = [];
		return mi(t) || (i = n ? t.toString().split("") : t.toString().split(RO)), {
			wordsWithComputedWidth: i.map((e) => ({
				word: e,
				width: eO(e, r).width
			})),
			spaceWidth: n ? 0 : eO("\xA0", r).width
		};
	} catch {
		return null;
	}
};
function BO(e) {
	return e === "start" || e === "middle" || e === "end" || e === "inherit";
}
function VO(e) {
	return mi(e) || typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
var HO = (e, t, n, r) => e.reduce((e, i) => {
	var a = i.word, o = i.width, s = e[e.length - 1];
	if (s && o != null && (t == null || r || s.width + o + n < Number(t))) s.words.push(a), s.width += o + n;
	else {
		var c = {
			words: [a],
			width: o
		};
		e.push(c);
	}
	return e;
}, []), UO = (e) => e.reduce((e, t) => e.width > t.width ? e : t), WO = "…", GO = (e, t, n, r, i, a, o, s) => {
	var c = zO({
		breakAll: n,
		style: r,
		children: e.slice(0, t) + WO
	});
	if (!c) return [!1, []];
	var l = HO(c.wordsWithComputedWidth, a, o, s);
	return [l.length > i || UO(l).width > Number(a), l];
}, KO = (e, t, n, r, i) => {
	var a = e.maxLines, o = e.children, s = e.style, c = e.breakAll, l = B(a), u = String(o), d = HO(t, r, n, i);
	if (!l || i || !(d.length > a || UO(d).width > Number(r))) return d;
	for (var f = 0, p = u.length - 1, m = 0, h; f <= p && m <= u.length - 1;) {
		var g = Math.floor((f + p) / 2), _ = MO(GO(u, g - 1, c, s, a, r, n, i), 2), v = _[0], y = _[1], b = MO(GO(u, g, c, s, a, r, n, i), 1)[0];
		if (!v && !b && (f = g + 1), v && b && (p = g - 1), !v && b) {
			h = y;
			break;
		}
		m++;
	}
	return h || d;
}, qO = (e) => [{
	words: mi(e) ? [] : e.toString().split(RO),
	width: void 0
}], JO = (e) => {
	var t = e.width, n = e.scaleToFit, r = e.children, i = e.style, a = e.breakAll, o = e.maxLines;
	if ((t || n) && !up.isSsr) {
		var s, c, l = zO({
			breakAll: a,
			children: r,
			style: i
		});
		if (l) {
			var u = l.wordsWithComputedWidth, d = l.spaceWidth;
			s = u, c = d;
		} else return qO(r);
		return KO({
			breakAll: a,
			children: r,
			maxLines: o,
			style: i
		}, s, c, t, !!n);
	}
	return qO(r);
}, YO = "#808080", XO = {
	angle: 0,
	breakAll: !1,
	capHeight: "0.71em",
	fill: YO,
	lineHeight: "1em",
	scaleToFit: !1,
	textAnchor: "start",
	verticalAnchor: "end",
	x: 0,
	y: 0
}, ZO = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = Fa(e, XO), r = n.x, i = n.y, a = n.lineHeight, o = n.capHeight, s = n.fill, c = n.scaleToFit, l = n.textAnchor, u = n.verticalAnchor, d = AO(n, DO), f = (0, y.useMemo)(() => JO({
		breakAll: d.breakAll,
		children: d.children,
		maxLines: d.maxLines,
		scaleToFit: c,
		style: d.style,
		width: d.width
	}), [
		d.breakAll,
		d.children,
		d.maxLines,
		c,
		d.style,
		d.width
	]), p = d.dx, m = d.dy, h = d.angle, g = d.className, _ = d.breakAll, v = AO(d, OO);
	if (!si(r) || !si(i) || f.length === 0) return null;
	var b = Number(r) + (B(p) ? p : 0), x = Number(i) + (B(m) ? m : 0);
	if (!q(b) || !q(x)) return null;
	var S;
	switch (u) {
		case "start":
			S = EO(`calc(${o})`);
			break;
		case "middle":
			S = EO(`calc(${(f.length - 1) / 2} * -${a} + (${o} / 2))`);
			break;
		default: S = EO(`calc(${f.length - 1} * -${a})`);
	}
	var C = [], w = f[0];
	if (c && w != null) {
		var T = w.width, E = d.width;
		C.push(`scale(${B(E) && B(T) ? E / T : 1})`);
	}
	return h && C.push(`rotate(${h}, ${b}, ${x})`), C.length && (v.transform = C.join(" ")), /*#__PURE__*/ y.createElement("text", kO({}, Nr(v), {
		ref: t,
		x: b,
		y: x,
		className: Tr("recharts-text", g),
		textAnchor: l,
		fill: s.includes("url") ? YO : s
	}), f.map((e, t) => {
		var n = e.words.join(_ ? "" : " ");
		return /*#__PURE__*/ y.createElement("tspan", {
			x: b,
			dy: t === 0 ? S : a,
			key: `${n}-${t}`
		}, n);
	}));
});
ZO.displayName = "Text";
//#endregion
//#region node_modules/recharts/es6/component/Label.js
var QO = ["labelRef"], $O = ["content"];
function ek(e, t) {
	if (e == null) return {};
	var n, r, i = tk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function tk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function nk(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function rk(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? nk(Object(n), !0).forEach(function(t) {
			ik(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : nk(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ik(e, t, n) {
	return (t = ak(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ak(e) {
	var t = ok(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ok(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function sk() {
	return sk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, sk.apply(null, arguments);
}
var ck = /*#__PURE__*/ (0, y.createContext)(null), lk = (e) => {
	var t = e.x, n = e.y, r = e.upperWidth, i = e.lowerWidth, a = e.width, o = e.height, s = e.children, c = (0, y.useMemo)(() => ({
		x: t,
		y: n,
		upperWidth: r,
		lowerWidth: i,
		width: a,
		height: o
	}), [
		t,
		n,
		r,
		i,
		a,
		o
	]);
	return /*#__PURE__*/ y.createElement(ck.Provider, { value: c }, s);
}, uk = () => {
	var e = (0, y.useContext)(ck), t = lf();
	return e || (t ? vi(t) : void 0);
}, dk = /*#__PURE__*/ (0, y.createContext)(null), fk = () => {
	var e = (0, y.useContext)(dk), t = U(t_);
	return e || t;
}, pk = (e) => {
	var t = e.value, n = e.formatter, r = mi(e.children) ? t : e.children;
	return typeof n == "function" ? n(r) : r;
}, mk = (e) => e != null && typeof e == "function", hk = (e, t) => ii(t - e) * Math.min(Math.abs(t - e), 360), gk = (e, t, n, r, i) => {
	var a = e.offset, o = e.className, s = i.cx, c = i.cy, l = i.innerRadius, u = i.outerRadius, d = i.startAngle, f = i.endAngle, p = i.clockWise, m = (l + u) / 2, h = hk(d, f), g = h >= 0 ? 1 : -1, _, v;
	switch (t) {
		case "insideStart":
			_ = d + g * a, v = p;
			break;
		case "insideEnd":
			_ = f - g * a, v = !p;
			break;
		case "end":
			_ = f + g * a, v = p;
			break;
		default: throw Error(`Unsupported position ${t}`);
	}
	v = h <= 0 ? v : !v;
	var b = Th(s, c, m, _), x = Th(s, c, m, _ + (v ? 1 : -1) * 359), S = `M${b.x},${b.y}
    A${m},${m},0,1,${+!v},
    ${x.x},${x.y}`, C = mi(e.id) ? li("recharts-radial-line-") : e.id;
	return /*#__PURE__*/ y.createElement("text", sk({}, r, {
		dominantBaseline: "central",
		className: Tr("recharts-radial-bar-label", o)
	}), /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement("path", {
		id: C,
		d: S
	})), /*#__PURE__*/ y.createElement("textPath", { xlinkHref: `#${C}` }, n));
}, _k = (e, t, n) => {
	var r = e.cx, i = e.cy, a = e.innerRadius, o = e.outerRadius, s = (e.startAngle + e.endAngle) / 2;
	if (n === "outside") {
		var c = Th(r, i, o + t, s), l = c.x;
		return {
			x: l,
			y: c.y,
			textAnchor: l >= r ? "start" : "end",
			verticalAnchor: "middle"
		};
	}
	if (n === "center") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
	if (n === "centerTop") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "start"
	};
	if (n === "centerBottom") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "end"
	};
	var u = Th(r, i, (a + o) / 2, s);
	return {
		x: u.x,
		y: u.y,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
}, vk = (e) => e != null && "cx" in e && B(e.cx), yk = {
	angle: 0,
	offset: 5,
	zIndex: Fg.label,
	position: "middle",
	textBreakAll: !1
};
function bk(e) {
	if (!vk(e)) return e;
	var t = e.cx, n = e.cy, r = e.outerRadius, i = r * 2;
	return {
		x: t - r,
		y: n - r,
		width: i,
		upperWidth: i,
		lowerWidth: i,
		height: i
	};
}
function xk(e) {
	var t = Fa(e, yk), n = t.viewBox, r = t.parentViewBox, i = t.position, a = t.value, o = t.children, s = t.content, c = t.className, l = c === void 0 ? "" : c, u = t.textBreakAll, d = t.labelRef, f = fk(), p = uk(), m = n == null ? i === "center" ? p : f ?? p : vk(n) ? n : vi(n), h, g, _ = bk(m);
	if (!m || mi(a) && mi(o) && !/*#__PURE__*/ (0, y.isValidElement)(s) && typeof s != "function") return null;
	var v = vk(m) && (i === "insideStart" || i === "insideEnd" || i === "end");
	if (vk(m)) v || (g = _k(m, t.offset, t.position));
	else if (_) {
		var b = wi({
			viewBox: _,
			position: i,
			offset: t.offset,
			parentViewBox: vk(r) ? void 0 : r,
			clamp: !0
		});
		g = rk(rk({
			x: b.x,
			y: b.y,
			textAnchor: b.horizontalAnchor,
			verticalAnchor: b.verticalAnchor
		}, b.width === void 0 ? {} : { width: b.width }), b.height === void 0 ? {} : { height: b.height });
	}
	var x = rk(rk(rk(rk({}, g?.x === void 0 ? {} : { x: g.x }), g?.y === void 0 ? {} : { y: g.y }), t), {}, { viewBox: m });
	if (/*#__PURE__*/ (0, y.isValidElement)(s)) {
		x.labelRef;
		var S = ek(x, QO);
		return /*#__PURE__*/ (0, y.cloneElement)(s, S);
	}
	if (typeof s == "function") {
		x.content;
		var C = ek(x, $O);
		if (h = /*#__PURE__*/ (0, y.createElement)(s, C), /*#__PURE__*/ (0, y.isValidElement)(h)) return h;
	} else h = pk(t);
	var w = Nr(t);
	return v && vk(m) ? gk(t, i, h, w, m) : g == null ? null : /*#__PURE__*/ y.createElement(zE, { zIndex: t.zIndex }, /*#__PURE__*/ y.createElement(ZO, sk({
		ref: d,
		className: Tr("recharts-label", l)
	}, w, g, {
		textAnchor: BO(w.textAnchor) ? w.textAnchor : g.textAnchor,
		breakAll: u
	}), h));
}
xk.displayName = "Label";
var Sk = (e, t, n) => {
	if (!e) return null;
	var r = {
		viewBox: t,
		labelRef: n
	};
	return e === !0 ? /*#__PURE__*/ y.createElement(xk, sk({ key: "label-implicit" }, r)) : si(e) ? /*#__PURE__*/ y.createElement(xk, sk({
		key: "label-implicit",
		value: e
	}, r)) : /*#__PURE__*/ (0, y.isValidElement)(e) ? e.type === xk ? /*#__PURE__*/ (0, y.cloneElement)(e, rk({ key: "label-implicit" }, r)) : /*#__PURE__*/ y.createElement(xk, sk({
		key: "label-implicit",
		content: e
	}, r)) : mk(e) ? /*#__PURE__*/ y.createElement(xk, sk({
		key: "label-implicit",
		content: e
	}, r)) : e && typeof e == "object" ? /*#__PURE__*/ y.createElement(xk, sk({}, e, { key: "label-implicit" }, r)) : null;
};
function Ck(e) {
	var t = e.label, n = e.labelRef;
	return Sk(t, uk(), n) || null;
}
//#endregion
//#region node_modules/recharts/es6/component/LabelList.js
var wk = ["valueAccessor"], Tk = [
	"dataKey",
	"clockWise",
	"id",
	"textBreakAll",
	"zIndex"
];
function Ek() {
	return Ek = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Ek.apply(null, arguments);
}
function Dk(e, t) {
	if (e == null) return {};
	var n, r, i = Ok(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Ok(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var kk = (e) => {
	var t = Array.isArray(e.value) ? e.value[e.value.length - 1] : e.value;
	if (VO(t)) return t;
}, Ak = /*#__PURE__*/ (0, y.createContext)(void 0), jk = Ak.Provider, Mk = /*#__PURE__*/ (0, y.createContext)(void 0);
Mk.Provider;
function Nk() {
	return (0, y.useContext)(Ak);
}
function Pk() {
	return (0, y.useContext)(Mk);
}
function Fk(e) {
	var t = e.valueAccessor, n = t === void 0 ? kk : t, r = Dk(e, wk), i = r.dataKey;
	r.clockWise;
	var a = r.id, o = r.textBreakAll, s = r.zIndex, c = Dk(r, Tk), l = Nk(), u = Pk(), d = l || u;
	return !d || !d.length ? null : /*#__PURE__*/ y.createElement(zE, { zIndex: s ?? Fg.label }, /*#__PURE__*/ y.createElement(Wr, { className: "recharts-label-list" }, d.map((e, t) => {
		var s = mi(i) ? n(e, t) : Uu(e.payload, i), l = mi(a) ? {} : { id: `${a}-${t}` };
		return /*#__PURE__*/ y.createElement(xk, Ek({ key: `label-${t}` }, Nr(e), c, l, {
			fill: r.fill ?? e.fill,
			parentViewBox: e.parentViewBox,
			value: s,
			textBreakAll: o,
			viewBox: e.viewBox,
			index: t,
			zIndex: 0
		}));
	})));
}
Fk.displayName = "LabelList";
function Ik(e) {
	var t = e.label;
	return t ? t === !0 ? /*#__PURE__*/ y.createElement(Fk, { key: "labelList-implicit" }) : /*#__PURE__*/ y.isValidElement(t) || mk(t) ? /*#__PURE__*/ y.createElement(Fk, {
		key: "labelList-implicit",
		content: t
	}) : typeof t == "object" ? /*#__PURE__*/ y.createElement(Fk, Ek({ key: "labelList-implicit" }, t, { type: String(t.type) })) : null : null;
}
//#endregion
//#region node_modules/recharts/es6/shape/Dot.js
function Lk() {
	return Lk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Lk.apply(null, arguments);
}
var Rk = (e) => {
	var t = e.cx, n = e.cy, r = e.r, i = e.className, a = Tr("recharts-dot", i);
	return B(t) && B(n) && B(r) ? /*#__PURE__*/ y.createElement("circle", Lk({}, jr(e), Da(e), {
		className: a,
		cx: t,
		cy: n,
		r
	})) : null;
}, zk = Hl({
	name: "polarAxis",
	initialState: {
		radiusAxis: {},
		angleAxis: {}
	},
	reducers: {
		addRadiusAxis(e, t) {
			e.radiusAxis[t.payload.id] = G(t.payload);
		},
		removeRadiusAxis(e, t) {
			delete e.radiusAxis[t.payload.id];
		},
		addAngleAxis(e, t) {
			e.angleAxis[t.payload.id] = G(t.payload);
		},
		removeAngleAxis(e, t) {
			delete e.angleAxis[t.payload.id];
		}
	}
}), Bk = zk.actions;
Bk.addRadiusAxis, Bk.removeRadiusAxis, Bk.addAngleAxis, Bk.removeAngleAxis;
var Vk = zk.reducer;
//#endregion
//#region node_modules/recharts/es6/util/getClassNameFromUnknown.js
function Hk(e) {
	return e && typeof e == "object" && "className" in e && typeof e.className == "string" ? e.className : "";
}
//#endregion
//#region node_modules/recharts/es6/util/ReactUtils.js
var Uk = (e) => e && typeof e == "object" && "clipDot" in e ? !!e.clipDot : !0;
//#endregion
//#region node_modules/recharts/es6/util/ActiveShapeUtils.js
function Wk(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Gk(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Wk(Object(n), !0).forEach(function(t) {
			Kk(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wk(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Kk(e, t, n) {
	return (t = qk(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function qk(e) {
	var t = Jk(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Jk(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Yk(e, t) {
	return Gk(Gk({}, t), e);
}
function Xk(e) {
	return /*#__PURE__*/ (0, y.isValidElement)(e) ? e.props : e;
}
function Zk(e, t) {
	return /*#__PURE__*/ (0, y.cloneElement)(e, Yk(Xk(e), t));
}
function Qk(e) {
	if ("index" in e) {
		var t = e.index;
		return typeof t == "number" || typeof t == "string" ? t : void 0;
	}
}
function $k(e) {
	return "isActive" in e && e.isActive === !0;
}
function eA(e) {
	var t = e.option, n = e.DefaultShape, r = e.shapeProps, i = e.activeClassName, a = i === void 0 ? "recharts-active-shape" : i, o = e.inActiveClassName, s = o === void 0 ? "recharts-shape" : o, c = Qk(r), l = /*#__PURE__*/ (0, y.isValidElement)(t) ? Zk(t, r) : t === n ? /*#__PURE__*/ y.createElement(n, r) : typeof t == "function" ? t(r, c) : typeof t == "object" ? /*#__PURE__*/ y.createElement(n, Yk(t, r)) : /*#__PURE__*/ y.createElement(n, r);
	return $k(r) ? /*#__PURE__*/ y.createElement(Wr, { className: a }, l) : /*#__PURE__*/ y.createElement(Wr, { className: s }, l);
}
//#endregion
//#region node_modules/recharts/es6/state/SetTooltipEntrySettings.js
function tA(e) {
	var t = e.tooltipEntrySettings, n = $o(), r = Ed(), i = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		r || (i.current === null ? n(Tw(t)) : i.current !== t && n(Ew({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		t,
		n,
		r
	]), (0, y.useLayoutEffect)(() => () => {
		i.current &&= (n(Dw(i.current)), null);
	}, [n]), null;
}
//#endregion
//#region node_modules/recharts/es6/state/SetLegendPayload.js
function nA(e) {
	var t = e.legendPayload, n = $o(), r = Ed(), i = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		r || (i.current === null ? n(xf(t)) : i.current !== t && n(Sf({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, y.useLayoutEffect)(() => () => {
		i.current &&= (n(Cf(i.current)), null);
	}, [n]), null;
}
//#endregion
//#region node_modules/recharts/es6/animation/matchBy.js
function rA(e, t) {
	return cA(e) || sA(e, t) || aA(e, t) || iA();
}
function iA() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function aA(e, t) {
	if (e) {
		if (typeof e == "string") return oA(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oA(e, t) : void 0;
	}
}
function oA(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function sA(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function cA(e) {
	if (Array.isArray(e)) return e;
}
var lA = "index";
function uA(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [], r = [];
	for (var i of n) r.push({
		status: "removed",
		prev: i
	});
	for (var a = 0; a < t.length; a++) {
		var o = e[a], s = t[a];
		o == null ? r.push({
			status: "added",
			next: s
		}) : r.push({
			status: "matched",
			prev: o,
			next: s
		});
	}
	return r;
}
function dA(e, t) {
	var n = e.length / t.length;
	return uA(t.map((t, r) => e[Math.floor(r * n)]), t);
}
function fA(e, t) {
	return uA(t.map((t, n) => e[n]), t);
}
function pA(e, t) {
	for (var n = /* @__PURE__ */ new Map(), r = 0; r < e.length; r++) {
		var i = e[r];
		if (i != null) {
			var a = t(i, r);
			a != null && !n.has(a) && n.set(a, i);
		}
	}
	return n;
}
function mA(e, t, n) {
	var r = pA(e, n), i = /* @__PURE__ */ new Set(), a = t.map((e, t) => {
		var a = n(e, t);
		if (a != null) {
			var o = r.get(a);
			if (o !== void 0) return i.add(a), o;
		}
	}), o = [];
	for (var s of r) {
		var c = rA(s, 2), l = c[0], u = c[1];
		i.has(l) || o.push(u);
	}
	return uA(a, t, o);
}
function hA(e, t, n) {
	return t == null ? null : e == null ? t.map((e) => ({
		status: "added",
		next: e
	})) : n === "index" ? dA(e, t) : n === "append" ? fA(e, t) : mA(e, t, n);
}
//#endregion
//#region node_modules/recharts/es6/animation/useAnimationStartSnapshot.js
function gA(e, t) {
	var n = (0, y.useRef)(e), r = (0, y.useRef)(t.current), i = (0, y.useRef)(!0);
	n.current !== e && (n.current = e, r.current = t.current, i.current = !1);
	var a = (0, y.useCallback)(function(e, n) {
		var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
		n === 0 ? i.current = !0 : (n === 1 && (r.current = e), n > 0 && i.current && a && (t.current = e));
	}, [t]);
	return {
		startValue: r.current,
		syncStepValue: a
	};
}
//#endregion
//#region node_modules/recharts/es6/animation/AnimatedItems.js
function _A(e, t) {
	return SA(e) || xA(e, t) || yA(e, t) || vA();
}
function vA() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function yA(e, t) {
	if (e) {
		if (typeof e == "string") return bA(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bA(e, t) : void 0;
	}
}
function bA(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function xA(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function SA(e) {
	if (Array.isArray(e)) return e;
}
function CA(e, t) {
	var n = _A((0, y.useState)(!1), 2), r = n[0], i = n[1];
	return {
		isAnimating: r,
		handleAnimationStart: (0, y.useCallback)(() => {
			typeof e == "function" && e(), i(!0);
		}, [e]),
		handleAnimationEnd: (0, y.useCallback)(() => {
			typeof t == "function" && t(), i(!1);
		}, [t])
	};
}
function wA(e) {
	var t = e.animationInput, n = e.animationIdPrefix, r = e.items, i = e.previousItemsRef, a = e.isAnimationActive, o = e.animationBegin, s = e.animationDuration, c = e.animationEasing, l = e.onAnimationStart, u = e.onAnimationEnd, d = e.animationInterpolateFn, f = e.animationMatchBy, p = e.shouldUpdatePreviousRef, m = e.children, h = e.layout, g = zm(t, n), _ = gA(g, i), v = _.startValue ?? null, b = hA(v, r, f ?? lA);
	return /*#__PURE__*/ y.createElement(Rm, {
		animationId: g,
		begin: o,
		duration: s,
		isActive: a,
		easing: c,
		onAnimationEnd: u,
		onAnimationStart: l,
		key: g
	}, (e) => {
		var t = v == null, n = r == null ? r : d(b, e, h), i = p ? p(e) : e > 0;
		return _.syncStepValue(n, e, i), n == null ? null : m(n, e, t);
	});
}
function TA(e, t) {
	return AA(e) || kA(e, t) || DA(e, t) || EA();
}
function EA() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function DA(e, t) {
	if (e) {
		if (typeof e == "string") return OA(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? OA(e, t) : void 0;
	}
}
function OA(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function kA(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function AA(e) {
	if (Array.isArray(e)) return e;
}
var jA = y.useId ?? (() => TA(y.useState(() => li("uid-")), 1)[0]);
//#endregion
//#region node_modules/recharts/es6/util/useUniqueId.js
function MA(e, t) {
	var n = jA();
	return t || (e ? `${e}-${n}` : n);
}
//#endregion
//#region node_modules/recharts/es6/context/RegisterGraphicalItemId.js
var NA = /*#__PURE__*/ (0, y.createContext)(void 0), PA = (e) => {
	var t = e.id, n = e.type, r = e.children, i = MA(`recharts-${n}`, t);
	return /*#__PURE__*/ y.createElement(NA.Provider, { value: i }, r(i));
}, FA = Hl({
	name: "graphicalItems",
	initialState: {
		cartesianItems: [],
		polarItems: []
	},
	reducers: {
		addCartesianGraphicalItem: {
			reducer(e, t) {
				e.cartesianItems.push(G(t.payload));
			},
			prepare: Dl()
		},
		replaceCartesianGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = pl(e).cartesianItems.indexOf(G(r));
				a > -1 && (e.cartesianItems[a] = G(i));
			},
			prepare: Dl()
		},
		removeCartesianGraphicalItem: {
			reducer(e, t) {
				var n = pl(e).cartesianItems.indexOf(G(t.payload));
				n > -1 && e.cartesianItems.splice(n, 1);
			},
			prepare: Dl()
		},
		addPolarGraphicalItem: {
			reducer(e, t) {
				e.polarItems.push(G(t.payload));
			},
			prepare: Dl()
		},
		removePolarGraphicalItem: {
			reducer(e, t) {
				var n = pl(e).polarItems.indexOf(G(t.payload));
				n > -1 && e.polarItems.splice(n, 1);
			},
			prepare: Dl()
		},
		replacePolarGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = pl(e).polarItems.indexOf(G(r));
				a > -1 && (e.polarItems[a] = G(i));
			},
			prepare: Dl()
		}
	}
}), IA = FA.actions, LA = IA.addCartesianGraphicalItem, RA = IA.replaceCartesianGraphicalItem, zA = IA.removeCartesianGraphicalItem;
IA.addPolarGraphicalItem, IA.removePolarGraphicalItem, IA.replacePolarGraphicalItem;
var BA = FA.reducer, VA = /*#__PURE__*/ (0, y.memo)((e) => {
	var t = $o(), n = (0, y.useRef)(null);
	return (0, y.useLayoutEffect)(() => {
		n.current === null ? t(LA(e)) : n.current !== e && t(RA({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(zA(n.current)), null);
	}, [t]), null;
}), HA = ["points"];
function UA(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function WA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? UA(Object(n), !0).forEach(function(t) {
			GA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : UA(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function GA(e, t, n) {
	return (t = KA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function KA(e) {
	var t = qA(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function qA(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function JA() {
	return JA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, JA.apply(null, arguments);
}
function YA(e, t) {
	if (e == null) return {};
	var n, r, i = XA(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function XA(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function ZA(e) {
	var t = e.option, n = e.dotProps, r = e.className;
	if (/*#__PURE__*/ (0, y.isValidElement)(t)) return /*#__PURE__*/ (0, y.cloneElement)(t, n);
	if (typeof t == "function") return t(n);
	var i = Tr(r, typeof t == "boolean" ? "" : t.className), a = n ?? {};
	a.points;
	var o = YA(a, HA);
	return /*#__PURE__*/ y.createElement(Rk, JA({}, o, { className: i }));
}
function QA(e, t) {
	return e == null ? !1 : t ? !0 : e.length === 1;
}
function $A(e) {
	var t = e.points, n = e.dot, r = e.className, i = e.dotClassName, a = e.dataKey, o = e.baseProps, s = e.needClip, c = e.clipPathId, l = e.zIndex, u = l === void 0 ? Fg.scatter : l;
	if (!QA(t, n)) return null;
	var d = Uk(n), f = Pr(n), p = t.map((e, r) => {
		var s = WA(WA(WA({ r: 3 }, o), f), {}, {
			index: r,
			cx: e.x ?? void 0,
			cy: e.y ?? void 0,
			dataKey: a,
			value: e.value,
			payload: e.payload,
			points: t
		});
		return /*#__PURE__*/ y.createElement(ZA, {
			key: `dot-${r}`,
			option: n,
			dotProps: s,
			className: i
		});
	}), m = {};
	return s && c != null && (m.clipPath = `url(#clipPath-${d ? "" : "dots-"}${c})`), /*#__PURE__*/ y.createElement(zE, { zIndex: u }, /*#__PURE__*/ y.createElement(Wr, JA({ className: r }, m), p));
}
//#endregion
//#region node_modules/recharts/es6/state/cartesianAxisSlice.js
function ej(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function tj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ej(Object(n), !0).forEach(function(t) {
			nj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ej(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function nj(e, t, n) {
	return (t = rj(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function rj(e) {
	var t = ij(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ij(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var aj = Hl({
	name: "cartesianAxis",
	initialState: {
		xAxis: {},
		yAxis: {},
		zAxis: {}
	},
	reducers: {
		addXAxis: {
			reducer(e, t) {
				e.xAxis[t.payload.id] = G(t.payload);
			},
			prepare: Dl()
		},
		replaceXAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.xAxis[r.id] !== void 0 && (r.id !== i.id && delete e.xAxis[r.id], e.xAxis[i.id] = G(i));
			},
			prepare: Dl()
		},
		removeXAxis: {
			reducer(e, t) {
				delete e.xAxis[t.payload.id];
			},
			prepare: Dl()
		},
		addYAxis: {
			reducer(e, t) {
				e.yAxis[t.payload.id] = G(t.payload);
			},
			prepare: Dl()
		},
		replaceYAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.yAxis[r.id] !== void 0 && (r.id !== i.id && delete e.yAxis[r.id], e.yAxis[i.id] = G(i));
			},
			prepare: Dl()
		},
		removeYAxis: {
			reducer(e, t) {
				delete e.yAxis[t.payload.id];
			},
			prepare: Dl()
		},
		addZAxis: {
			reducer(e, t) {
				e.zAxis[t.payload.id] = G(t.payload);
			},
			prepare: Dl()
		},
		replaceZAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.zAxis[r.id] !== void 0 && (r.id !== i.id && delete e.zAxis[r.id], e.zAxis[i.id] = G(i));
			},
			prepare: Dl()
		},
		removeZAxis: {
			reducer(e, t) {
				delete e.zAxis[t.payload.id];
			},
			prepare: Dl()
		},
		updateYAxisWidth(e, t) {
			var n = t.payload, r = n.id, i = n.width, a = e.yAxis[r];
			if (a) {
				var o = a.widthHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.width && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.yAxis[r] = tj(tj({}, a), {}, {
					width: i,
					widthHistory: s
				});
			}
		},
		updateXAxisHeight(e, t) {
			var n = t.payload, r = n.id, i = n.height, a = e.xAxis[r];
			if (a) {
				var o = a.heightHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.height && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.xAxis[r] = tj(tj({}, a), {}, {
					height: i,
					heightHistory: s
				});
			}
		}
	}
}), oj = aj.actions, sj = oj.addXAxis, cj = oj.replaceXAxis, lj = oj.removeXAxis, uj = oj.addYAxis, dj = oj.replaceYAxis, fj = oj.removeYAxis;
oj.addZAxis, oj.replaceZAxis, oj.removeZAxis;
var pj = oj.updateYAxisWidth, mj = oj.updateXAxisHeight, hj = aj.reducer, gj = W([
	W([Sd], (e) => ({
		top: e.top,
		bottom: e.bottom,
		left: e.left,
		right: e.right
	})),
	ad,
	od
], (e, t, n) => {
	if (e && t != null && n != null) return {
		x: e.left,
		y: e.top,
		width: Math.max(0, t - e.left - e.right),
		height: Math.max(0, n - e.top - e.bottom)
	};
}), _j = function() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, t = Ed();
	return U((n) => KC(n, "xAxis", e, t))?.map;
}, vj = () => U(gj), yj = () => U(VT);
//#endregion
//#region node_modules/recharts/es6/component/ActivePoints.js
function bj(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function xj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? bj(Object(n), !0).forEach(function(t) {
			Sj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bj(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Sj(e, t, n) {
	return (t = Cj(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Cj(e) {
	var t = wj(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function wj(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Tj = (e) => {
	var t = e.point, n = e.childIndex, r = e.mainColor, i = e.activeDot, a = e.dataKey, o = e.clipPath;
	if (i === !1 || t.x == null || t.y == null) return null;
	var s = xj(xj(xj({}, {
		index: n,
		dataKey: a,
		cx: t.x,
		cy: t.y,
		r: 4,
		fill: r ?? "none",
		strokeWidth: 2,
		stroke: "#fff",
		payload: t.payload,
		value: t.value
	}), Mr(i)), Da(i)), c = /*#__PURE__*/ (0, y.isValidElement)(i) ? /*#__PURE__*/ (0, y.cloneElement)(i, s) : typeof i == "function" ? i(s) : /*#__PURE__*/ y.createElement(Rk, s);
	return /*#__PURE__*/ y.createElement(Wr, {
		className: "recharts-active-dot",
		clipPath: o
	}, c);
};
function Ej(e) {
	var t = e.points, n = e.mainColor, r = e.activeDot, i = e.itemDataKey, a = e.clipPath, o = e.zIndex, s = o === void 0 ? Fg.activeDot : o, c = U(PT), l = yj();
	if (t == null || l == null) return null;
	var u = t.find((e) => l.includes(e.payload));
	return mi(u) ? null : /*#__PURE__*/ y.createElement(zE, { zIndex: s }, /*#__PURE__*/ y.createElement(Tj, {
		point: u,
		childIndex: Number(c),
		mainColor: n,
		dataKey: i,
		activeDot: r,
		clipPath: a
	}));
}
//#endregion
//#region node_modules/recharts/es6/context/chartDataContext.js
var Dj = (e) => {
	var t = e.chartData, n = $o(), r = Ed();
	return (0, y.useEffect)(() => r ? () => {} : (n(cD(t)), () => {
		n(cD(void 0));
	}), [
		t,
		n,
		r
	]), null;
}, Oj = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
}, kj = Hl({
	name: "brush",
	initialState: Oj,
	reducers: { setBrushSettings(e, t) {
		return t.payload == null ? Oj : t.payload;
	} }
});
kj.actions.setBrushSettings;
var Aj = kj.reducer, jj = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return {
		x: Math.min(n, i),
		y: Math.min(r, a),
		width: Math.abs(i - n),
		height: Math.abs(a - r)
	};
}, Mj = (e) => {
	var t = e.x1, n = e.y1, r = e.x2, i = e.y2;
	return jj({
		x: t,
		y: n
	}, {
		x: r,
		y: i
	});
};
function Nj(e) {
	return (e % 180 + 180) % 180;
}
var Pj = function(e) {
	var t = e.width, n = e.height, r = Nj(arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0) * Math.PI / 180, i = Math.atan(n / t), a = r > i && r < Math.PI - i ? n / Math.sin(r) : t / Math.cos(r);
	return Math.abs(a);
}, Fj = Hl({
	name: "referenceElements",
	initialState: {
		dots: [],
		areas: [],
		lines: []
	},
	reducers: {
		addDot: (e, t) => {
			e.dots.push(t.payload);
		},
		removeDot: (e, t) => {
			var n = pl(e).dots.findIndex((e) => e === t.payload);
			n !== -1 && e.dots.splice(n, 1);
		},
		addArea: (e, t) => {
			e.areas.push(t.payload);
		},
		removeArea: (e, t) => {
			var n = pl(e).areas.findIndex((e) => e === t.payload);
			n !== -1 && e.areas.splice(n, 1);
		},
		addLine: (e, t) => {
			e.lines.push(G(t.payload));
		},
		removeLine: (e, t) => {
			var n = pl(e).lines.findIndex((e) => e === t.payload);
			n !== -1 && e.lines.splice(n, 1);
		}
	}
}), Ij = Fj.actions;
Ij.addDot, Ij.removeDot, Ij.addArea, Ij.removeArea;
var Lj = Ij.addLine, Rj = Ij.removeLine, zj = Fj.reducer;
//#endregion
//#region node_modules/recharts/es6/container/ClipPathProvider.js
function Bj(e, t) {
	return Gj(e) || Wj(e, t) || Hj(e, t) || Vj();
}
function Vj() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Hj(e, t) {
	if (e) {
		if (typeof e == "string") return Uj(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Uj(e, t) : void 0;
	}
}
function Uj(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Wj(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Gj(e) {
	if (Array.isArray(e)) return e;
}
var Kj = /*#__PURE__*/ (0, y.createContext)(void 0), qj = (e) => {
	var t = e.children, n = Bj((0, y.useState)(`${li("recharts")}-clip`), 1)[0], r = vj();
	if (r == null) return null;
	var i = r.x, a = r.y, o = r.width, s = r.height;
	return /*#__PURE__*/ y.createElement(Kj.Provider, { value: n }, /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement("clipPath", { id: n }, /*#__PURE__*/ y.createElement("rect", {
		x: i,
		y: a,
		height: s,
		width: o
	}))), t);
}, Jj = () => (0, y.useContext)(Kj), Yj = class {
	constructor(e) {
		var t = e.x, n = e.y;
		this.xAxisScale = t, this.yAxisScale = n;
	}
	map(e, t) {
		var n = t.position;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? 0,
			y: this.yAxisScale.map(e.y, { position: n }) ?? 0
		};
	}
	mapWithFallback(e, t) {
		var n = t.position, r = t.fallback, i = r === "rangeMin" ? this.yAxisScale.rangeMin() : r === "rangeMax" ? this.yAxisScale.rangeMax() : 0, a = r === "rangeMin" ? this.xAxisScale.rangeMin() : r === "rangeMax" ? this.xAxisScale.rangeMax() : 0;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? a,
			y: this.yAxisScale.map(e.y, { position: n }) ?? i
		};
	}
	isInRange(e) {
		var t = e.x, n = e.y, r = t == null || this.xAxisScale.isInRange(t), i = n == null || this.yAxisScale.isInRange(n);
		return r && i;
	}
};
//#endregion
//#region node_modules/recharts/es6/cartesian/ReferenceLine.js
function Xj(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Zj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Xj(Object(n), !0).forEach(function(t) {
			Qj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Xj(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Qj(e, t, n) {
	return (t = $j(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function $j(e) {
	var t = eM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function eM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function tM() {
	return tM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, tM.apply(null, arguments);
}
var nM = (e, t) => {
	var n;
	if (/*#__PURE__*/ y.isValidElement(e)) n = /*#__PURE__*/ y.cloneElement(e, t);
	else if (typeof e == "function") n = e(t);
	else {
		if (!q(t.x1) || !q(t.y1) || !q(t.x2) || !q(t.y2)) return null;
		n = /*#__PURE__*/ y.createElement("line", tM({}, t, { className: "recharts-reference-line-line" }));
	}
	return n;
}, rM = (e, t, n, r, i, a) => {
	var o = a.x, s = a.width, c = i.map(e, { position: n });
	if (!q(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: o + s,
		y: c
	}, {
		x: o,
		y: c
	}];
	return r === "left" ? l.reverse() : l;
}, iM = (e, t, n, r, i, a) => {
	var o = a.y, s = a.height, c = i.map(e, { position: n });
	if (!q(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: c,
		y: o + s
	}, {
		x: c,
		y: o
	}];
	return r === "top" ? l.reverse() : l;
}, aM = (e, t, n, r) => {
	var i = [r.mapWithFallback(e[0], {
		position: n,
		fallback: "rangeMin"
	}), r.mapWithFallback(e[1], {
		position: n,
		fallback: "rangeMax"
	})];
	return t === "discard" && i.some((e) => !r.isInRange(e)) ? null : i;
}, oM = (e, t, n, r, i, a, o) => {
	var s = o.x, c = o.y, l = o.segment, u = o.ifOverflow, d = si(s);
	return si(c) ? rM(c, u, r, a, t, n) : d ? iM(s, u, r, i, e, n) : l != null && l.length === 2 ? aM(l, u, r, new Yj({
		x: e,
		y: t
	})) : null;
};
function sM(e) {
	var t = $o();
	return (0, y.useEffect)(() => (t(Lj(e)), () => {
		t(Rj(e));
	})), null;
}
function cM(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.shape, i = e.className, a = e.ifOverflow, o = Ed(), s = Jj(), c = U((e) => fS(e, t)), l = U((e) => hS(e, n)), u = U((e) => KC(e, "xAxis", t, o)), d = U((e) => KC(e, "yAxis", n, o)), f = lf();
	if (!s || !f || c == null || l == null || u == null || d == null) return null;
	var p = oM(u, d, f, e.position, c.orientation, l.orientation, e);
	if (!p) return null;
	var m = p[0], h = p[1];
	if (m == null || h == null) return null;
	var g = m.x, _ = m.y, v = h.x, b = h.y, x = Zj(Zj({ clipPath: a === "hidden" ? `url(#${s})` : void 0 }, Nr(e)), {}, {
		x1: g,
		y1: _,
		x2: v,
		y2: b
	}), S = Mj({
		x1: g,
		y1: _,
		x2: v,
		y2: b
	});
	return /*#__PURE__*/ y.createElement(zE, { zIndex: e.zIndex }, /*#__PURE__*/ y.createElement(Wr, { className: Tr("recharts-reference-line", i) }, nM(r, x), /*#__PURE__*/ y.createElement(lk, tM({}, S, {
		lowerWidth: S.width,
		upperWidth: S.width
	}), /*#__PURE__*/ y.createElement(Ck, { label: e.label }), e.children)));
}
var lM = {
	ifOverflow: "discard",
	xAxisId: 0,
	yAxisId: 0,
	fill: "none",
	label: !1,
	stroke: "#ccc",
	fillOpacity: 1,
	strokeWidth: 1,
	position: "middle",
	zIndex: Fg.line
};
function uM(e) {
	var t = Fa(e, lM);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(sM, {
		yAxisId: t.yAxisId,
		xAxisId: t.xAxisId,
		ifOverflow: t.ifOverflow,
		x: t.x,
		y: t.y,
		segment: t.segment
	}), /*#__PURE__*/ y.createElement(cM, t));
}
uM.displayName = "ReferenceLine";
//#endregion
//#region node_modules/es-toolkit/dist/function/noop.mjs
function dM() {}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function fM(e) {
	if (!e || typeof e != "object") return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null ? !1 : Object.prototype.toString.call(e) === "[object Object]";
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function pM(e, t, n) {
	return mM(e, t, void 0, void 0, void 0, void 0, n);
}
function mM(e, t, n, r, i, a, o) {
	let s = o(e, t, n, r, i, a);
	if (s !== void 0) return s;
	if (typeof e == typeof t) switch (typeof e) {
		case "bigint":
		case "string":
		case "boolean":
		case "symbol":
		case "undefined": return e === t;
		case "number": return e === t || Object.is(e, t);
		case "function": return e === t;
		case "object": return hM(e, t, a, o);
	}
	return hM(e, t, a, o);
}
function hM(e, t, n, r) {
	if (Object.is(e, t)) return !0;
	let i = Ga(e), a = Ga(t);
	if (i === "[object Arguments]" && (i = io), a === "[object Arguments]" && (a = io), i !== a) return !1;
	switch (i) {
		case qa: return e.toString() === t.toString();
		case Ja: return Eo(e.valueOf(), t.valueOf());
		case Ya:
		case Qa:
		case Za: return Object.is(e.valueOf(), t.valueOf());
		case Ka: return e.source === t.source && e.flags === t.flags;
		case no: return e === t;
	}
	n ??= /* @__PURE__ */ new Map();
	let o = n.get(e), s = n.get(t);
	if (o != null && s != null) return o === t;
	n.set(e, t), n.set(t, e);
	try {
		switch (i) {
			case $a:
				if (e.size !== t.size) return !1;
				for (let [i, a] of e.entries()) if (!t.has(i) || !mM(a, t.get(i), i, e, t, n, r)) return !1;
				return !0;
			case eo: {
				if (e.size !== t.size) return !1;
				let i = Array.from(e.values()), a = Array.from(t.values());
				for (let o = 0; o < i.length; o++) {
					let s = i[o], c = a.findIndex((i) => mM(s, i, void 0, e, t, n, r));
					if (c === -1) return !1;
					a.splice(c, 1);
				}
				return !0;
			}
			case to:
			case so:
			case co:
			case lo:
			case uo:
			case fo:
			case po:
			case mo:
			case ho:
			case go:
			case _o:
			case vo:
				if (bo(e) !== bo(t) || e.length !== t.length) return !1;
				for (let i = 0; i < e.length; i++) if (!mM(e[i], t[i], i, e, t, n, r)) return !1;
				return !0;
			case ro: return e.byteLength === t.byteLength && hM(new Uint8Array(e), new Uint8Array(t), n, r);
			case oo: return e.byteLength !== t.byteLength || e.byteOffset !== t.byteOffset ? !1 : hM(new Uint8Array(e), new Uint8Array(t), n, r);
			case ao: return e.name === t.name && e.message === t.message;
			case io: {
				if (!(hM(e.constructor, t.constructor, n, r) || fM(e) && fM(t))) return !1;
				let i = [...Object.keys(e), ...Wa(e)], a = [...Object.keys(t), ...Wa(t)];
				if (i.length !== a.length) return !1;
				for (let a = 0; a < i.length; a++) {
					let o = i[a], s = e[o];
					if (!Object.hasOwn(t, o)) return !1;
					let c = t[o];
					if (!mM(s, c, o, e, t, n, r)) return !1;
				}
				return !0;
			}
			default: return !1;
		}
	} finally {
		n.delete(e), n.delete(t);
	}
}
//#endregion
//#region node_modules/es-toolkit/dist/predicate/isEqual.mjs
function gM(e, t) {
	return pM(e, t, dM);
}
//#endregion
//#region node_modules/recharts/es6/util/getEveryNth.js
function _M(e, t) {
	if (t < 1) return [];
	if (t === 1) return e;
	for (var n = [], r = 0; r < e.length; r += t) {
		var i = e[r];
		i !== void 0 && n.push(i);
	}
	return n;
}
//#endregion
//#region node_modules/recharts/es6/util/TickUtils.js
function vM(e, t, n) {
	return Pj({
		width: e.width + t.width,
		height: e.height + t.height
	}, n);
}
function yM(e, t, n) {
	var r = n === "width", i = e.x, a = e.y, o = e.width, s = e.height;
	return t === 1 ? {
		start: r ? i : a,
		end: r ? i + o : a + s
	} : {
		start: r ? i + o : a + s,
		end: r ? i : a
	};
}
function bM(e, t, n, r, i) {
	if (e * t < e * r || e * t > e * i) return !1;
	var a = n();
	return e * (t - e * a / 2 - r) >= 0 && e * (t + e * a / 2 - i) <= 0;
}
function xM(e, t) {
	return _M(e, t + 1);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getEquidistantTicks.js
function SM(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = t.start, s = t.end, c = 0, l = 1, u = o, d = function() {
		var t = r?.[c];
		if (t === void 0) return { v: _M(r, l) };
		var a = c, d, f = () => (d === void 0 && (d = n(t, a)), d), p = t.coordinate, m = c === 0 || bM(e, p, f, u, s);
		m || (c = 0, u = o, l += 1), m && (u = p + e * (f() / 2 + i), c += l);
	}, f; l <= a.length;) if (f = d(), f) return f.v;
	return [];
}
function CM(e, t, n, r, i) {
	var a = (r || []).slice().length;
	if (a === 0) return [];
	for (var o = t.start, s = t.end, c = 1; c <= a; c++) {
		for (var l = (a - 1) % c, u = o, d = !0, f = function() {
			var t = r[m];
			if (t == null) return 0;
			var a = m, o, c = () => (o === void 0 && (o = n(t, a)), o), f = t.coordinate, p = m === l || bM(e, f, c, u, s);
			if (!p) return d = !1, 1;
			p && (u = f + e * (c() / 2 + i));
		}, p, m = l; m < a && (p = f(), p === 0 || p !== 1); m += c);
		if (d) {
			for (var h = [], g = l; g < a; g += c) {
				var _ = r[g];
				_ != null && h.push(_);
			}
			return h;
		}
	}
	return [];
}
//#endregion
//#region node_modules/recharts/es6/cartesian/getTicks.js
function wM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function TM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? wM(Object(n), !0).forEach(function(t) {
			EM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function EM(e, t, n) {
	return (t = DM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function DM(e) {
	var t = OM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function OM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function kM(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = a.length, s = t.start, c = t.end, l = function(t) {
		var r = a[t];
		if (r == null) return 1;
		var l = r, u, d = () => (u === void 0 && (u = n(r, t)), u);
		if (t === o - 1) {
			var f = e * (l.coordinate + e * d() / 2 - c);
			a[t] = l = TM(TM({}, l), {}, { tickCoord: f > 0 ? l.coordinate - f * e : l.coordinate });
		} else a[t] = l = TM(TM({}, l), {}, { tickCoord: l.coordinate });
		l.tickCoord != null && bM(e, l.tickCoord, d, s, c) && (c = l.tickCoord - e * (d() / 2 + i), a[t] = TM(TM({}, l), {}, { isShow: !0 }));
	}, u = o - 1; u >= 0; u--) if (l(u)) continue;
	return a;
}
function AM(e, t, n, r, i, a) {
	var o = (r || []).slice(), s = o.length, c = t.start, l = t.end;
	if (a) {
		var u = r[s - 1];
		if (u != null) {
			var d = n(u, s - 1), f = e * (u.coordinate + e * d / 2 - l);
			o[s - 1] = u = TM(TM({}, u), {}, { tickCoord: f > 0 ? u.coordinate - f * e : u.coordinate }), u.tickCoord != null && bM(e, u.tickCoord, () => d, c, l) && (l = u.tickCoord - e * (d / 2 + i), o[s - 1] = TM(TM({}, u), {}, { isShow: !0 }));
		}
	}
	for (var p = a ? s - 1 : s, m = function(t) {
		var r = o[t];
		if (r == null) return 1;
		var a = r, s, u = () => (s === void 0 && (s = n(r, t)), s);
		if (t === 0) {
			var d = e * (a.coordinate - e * u() / 2 - c);
			o[t] = a = TM(TM({}, a), {}, { tickCoord: d < 0 ? a.coordinate - d * e : a.coordinate });
		} else o[t] = a = TM(TM({}, a), {}, { tickCoord: a.coordinate });
		a.tickCoord != null && bM(e, a.tickCoord, u, c, l) && (c = a.tickCoord + e * (u() / 2 + i), o[t] = TM(TM({}, a), {}, { isShow: !0 }));
	}, h = 0; h < p; h++) if (m(h)) continue;
	return o;
}
function jM(e, t, n) {
	var r = e.tick, i = e.ticks, a = e.viewBox, o = e.minTickGap, s = e.orientation, c = e.interval, l = e.tickFormatter, u = e.unit, d = e.angle;
	if (!i || !i.length || !r) return [];
	if (B(c) || up.isSsr) return xM(i, B(c) ? c : 0) ?? [];
	var f = [], p = s === "top" || s === "bottom" ? "width" : "height", m = u && p === "width" ? eO(u, {
		fontSize: t,
		letterSpacing: n
	}) : {
		width: 0,
		height: 0
	}, h = (e, r) => {
		var i = typeof l == "function" ? l(e.value, r) : e.value;
		return p === "width" ? vM(eO(i, {
			fontSize: t,
			letterSpacing: n
		}), m, d) : eO(i, {
			fontSize: t,
			letterSpacing: n
		})[p];
	}, g = i[0], _ = i[1], v = i.length >= 2 && g != null && _ != null ? ii(_.coordinate - g.coordinate) : 1, y = yM(a, v, p);
	return c === "equidistantPreserveStart" ? SM(v, y, h, i, o) : c === "equidistantPreserveEnd" ? CM(v, y, h, i, o) : (f = c === "preserveStart" || c === "preserveStartEnd" ? AM(v, y, h, i, o, c === "preserveStartEnd") : kM(v, y, h, i, o), f.filter((e) => e.isShow));
}
//#endregion
//#region node_modules/recharts/es6/util/YAxisUtils.js
var MM = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.width > l && (l = t.width);
			}
		});
		var u = n ? n.getBoundingClientRect().width : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, NM = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.height > l && (l = t.height);
			}
		});
		var u = n ? n.getBoundingClientRect().height : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, PM = Hl({
	name: "renderedTicks",
	initialState: {
		xAxis: {},
		yAxis: {}
	},
	reducers: {
		setRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId, a = n.ticks;
			e[r][i] = G(a);
		},
		removeRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId;
			delete e[r][i];
		}
	}
}), FM = PM.actions, IM = FM.setRenderedTicks, LM = FM.removeRenderedTicks, RM = PM.reducer, zM = [
	"axisLine",
	"width",
	"height",
	"className",
	"hide",
	"ticks",
	"axisType",
	"axisId"
];
function BM(e, t) {
	return GM(e) || WM(e, t) || HM(e, t) || VM();
}
function VM() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function HM(e, t) {
	if (e) {
		if (typeof e == "string") return UM(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? UM(e, t) : void 0;
	}
}
function UM(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function WM(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function GM(e) {
	if (Array.isArray(e)) return e;
}
function KM(e, t) {
	if (e == null) return {};
	var n, r, i = qM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function qM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function JM() {
	return JM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, JM.apply(null, arguments);
}
function YM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function XM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? YM(Object(n), !0).forEach(function(t) {
			ZM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : YM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ZM(e, t, n) {
	return (t = QM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function QM(e) {
	var t = $M(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function $M(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var eN = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	viewBox: {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	orientation: "bottom",
	ticks: [],
	stroke: "#666",
	tickLine: !0,
	axisLine: !0,
	tick: !0,
	mirror: !1,
	minTickGap: 5,
	tickSize: 6,
	tickMargin: 2,
	interval: "preserveEnd",
	zIndex: Fg.axis
};
function tN(e) {
	var t = e.x, n = e.y, r = e.width, i = e.height, a = e.orientation, o = e.mirror, s = e.axisLine, c = e.otherSvgProps;
	if (!s) return null;
	var l = XM(XM(XM({}, c), jr(s)), {}, { fill: "none" });
	if (a === "top" || a === "bottom") {
		var u = +(a === "top" && !o || a === "bottom" && o);
		l = XM(XM({}, l), {}, {
			x1: t,
			y1: n + u * i,
			x2: t + r,
			y2: n + u * i
		});
	} else {
		var d = +(a === "left" && !o || a === "right" && o);
		l = XM(XM({}, l), {}, {
			x1: t + d * r,
			y1: n,
			x2: t + d * r,
			y2: n + i
		});
	}
	return /*#__PURE__*/ y.createElement("line", JM({}, l, { className: Tr("recharts-cartesian-axis-line", $r(s, "className")) }));
}
function nN(e, t, n, r, i, a, o, s, c) {
	var l, u, d, f, p, m, h = s ? -1 : 1, g = e.tickSize || o, _ = B(e.tickCoord) ? e.tickCoord : e.coordinate;
	switch (a) {
		case "top":
			l = u = e.coordinate, f = n + +!s * i, d = f - h * g, m = d - h * c, p = _;
			break;
		case "left":
			d = f = e.coordinate, u = t + +!s * r, l = u - h * g, p = l - h * c, m = _;
			break;
		case "right":
			d = f = e.coordinate, u = t + +s * r, l = u + h * g, p = l + h * c, m = _;
			break;
		default: l = u = e.coordinate, f = n + +s * i, d = f + h * g, m = d + h * c, p = _;
	}
	return {
		line: {
			x1: l,
			y1: d,
			x2: u,
			y2: f
		},
		tick: {
			x: p,
			y: m
		}
	};
}
function rN(e, t) {
	switch (e) {
		case "left": return t ? "start" : "end";
		case "right": return t ? "end" : "start";
		default: return "middle";
	}
}
function iN(e, t) {
	switch (e) {
		case "left":
		case "right": return "middle";
		case "top": return t ? "start" : "end";
		default: return t ? "end" : "start";
	}
}
function aN(e) {
	var t = e.option, n = e.tickProps, r = e.value, i, a = Tr(n.className, "recharts-cartesian-axis-tick-value");
	if (/*#__PURE__*/ y.isValidElement(t)) i = /*#__PURE__*/ y.cloneElement(t, XM(XM({}, n), {}, { className: a }));
	else if (typeof t == "function") i = t(XM(XM({}, n), {}, { className: a }));
	else {
		var o = "recharts-cartesian-axis-tick-value";
		typeof t != "boolean" && (o = Tr(o, Hk(t))), i = /*#__PURE__*/ y.createElement(ZO, JM({}, n, { className: o }), r);
	}
	return i;
}
function oN(e) {
	var t = e.ticks, n = e.axisType, r = e.axisId, i = $o(), a = (0, y.useRef)(null);
	return (0, y.useEffect)(() => {
		if (r != null && n != null) {
			var e = t.map((e) => ({
				value: e.value,
				coordinate: e.coordinate,
				offset: e.offset,
				index: e.index
			})), o = a.current;
			o != null && o.axisId === r && o.axisType === n && gM(o.ticks, e) || (a.current = {
				ticks: e,
				axisId: r,
				axisType: n
			}, i(IM({
				ticks: e,
				axisId: r,
				axisType: n
			})));
		}
	}, [
		i,
		t,
		r,
		n
	]), (0, y.useEffect)(() => r == null || n == null ? _i : () => {
		i(LM({
			axisId: r,
			axisType: n
		}));
	}, [
		i,
		r,
		n
	]), null;
}
var sN = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.ticks, r = n === void 0 ? [] : n, i = e.tick, a = e.tickLine, o = e.stroke, s = e.tickFormatter, c = e.unit, l = e.padding, u = e.tickTextProps, d = e.orientation, f = e.mirror, p = e.x, m = e.y, h = e.width, g = e.height, _ = e.tickSize, v = e.tickMargin, b = e.fontSize, x = e.letterSpacing, S = e.getTicksConfig, C = e.events, w = e.axisType, T = e.axisId, E = jM(XM(XM({}, S), {}, { ticks: r }), b, x), D = jr(S), O = Mr(i), k = BO(D.textAnchor) ? D.textAnchor : rN(d, f), A = iN(d, f), j = {};
	typeof a == "object" && (j = a);
	var M = XM(XM({}, D), {}, { fill: "none" }, j), N = E.map((e) => XM({ entry: e }, nN(e, p, m, h, g, d, _, f, v))), ee = N.map((e) => {
		var t = e.entry, n = e.line;
		return /*#__PURE__*/ y.createElement(Wr, {
			className: "recharts-cartesian-axis-tick",
			key: `tick-${t.value}-${t.coordinate}-${t.tickCoord}`
		}, a && /*#__PURE__*/ y.createElement("line", JM({}, M, n, { className: Tr("recharts-cartesian-axis-tick-line", $r(a, "className")) })));
	}), te = N.map((e, t) => {
		var n = e.entry, r = e.tick, a = XM(XM({}, XM(XM(XM(XM({ verticalAnchor: A }, D), {}, {
			textAnchor: k,
			stroke: "none",
			fill: o
		}, r), {}, {
			index: t,
			payload: n,
			visibleTicksCount: E.length,
			tickFormatter: s,
			padding: l
		}, u), {}, { angle: u?.angle ?? D.angle ?? 0 })), O);
		return /*#__PURE__*/ y.createElement(Wr, JM({
			className: "recharts-cartesian-axis-tick-label",
			key: `tick-label-${n.value}-${n.coordinate}-${n.tickCoord}`
		}, ka(C, n, t)), i && /*#__PURE__*/ y.createElement(aN, {
			option: i,
			tickProps: a,
			value: `${typeof s == "function" ? s(n.value, t) : n.value}${c || ""}`
		}));
	});
	return /*#__PURE__*/ y.createElement("g", { className: `recharts-cartesian-axis-ticks recharts-${w}-ticks` }, /*#__PURE__*/ y.createElement(oN, {
		ticks: E,
		axisId: T,
		axisType: w
	}), te.length > 0 && /*#__PURE__*/ y.createElement(zE, { zIndex: Fg.label }, /*#__PURE__*/ y.createElement("g", {
		className: `recharts-cartesian-axis-tick-labels recharts-${w}-tick-labels`,
		ref: t
	}, te)), ee.length > 0 && /*#__PURE__*/ y.createElement("g", { className: `recharts-cartesian-axis-tick-lines recharts-${w}-tick-lines` }, ee));
}), cN = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.axisLine, r = e.width, i = e.height, a = e.className, o = e.hide, s = e.ticks, c = e.axisType, l = e.axisId, u = KM(e, zM), d = BM((0, y.useState)(""), 2), f = d[0], p = d[1], m = BM((0, y.useState)(""), 2), h = m[0], g = m[1], _ = (0, y.useRef)(null);
	(0, y.useImperativeHandle)(t, () => ({
		getCalculatedWidth: () => MM({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		}),
		getCalculatedHeight: () => NM({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		})
	}));
	var v = (0, y.useCallback)((e) => {
		if (e) {
			var t = e.getElementsByClassName("recharts-cartesian-axis-tick-value");
			_.current = t;
			var n = t[0];
			if (n) {
				var r = window.getComputedStyle(n), i = r.fontSize, a = r.letterSpacing;
				(i !== f || a !== h) && (p(i), g(a));
			}
		}
	}, [f, h]);
	return o || r != null && r <= 0 || i != null && i <= 0 ? null : /*#__PURE__*/ y.createElement(zE, { zIndex: e.zIndex }, /*#__PURE__*/ y.createElement(Wr, { className: Tr("recharts-cartesian-axis", a) }, /*#__PURE__*/ y.createElement(tN, {
		x: e.x,
		y: e.y,
		width: r,
		height: i,
		orientation: e.orientation,
		mirror: e.mirror,
		axisLine: n,
		otherSvgProps: jr(e)
	}), /*#__PURE__*/ y.createElement(sN, {
		ref: v,
		axisType: c,
		events: u,
		fontSize: f,
		getTicksConfig: e,
		height: e.height,
		letterSpacing: h,
		mirror: e.mirror,
		orientation: e.orientation,
		padding: e.padding,
		stroke: e.stroke,
		tick: e.tick,
		tickFormatter: e.tickFormatter,
		tickLine: e.tickLine,
		tickMargin: e.tickMargin,
		tickSize: e.tickSize,
		tickTextProps: e.tickTextProps,
		ticks: s,
		unit: e.unit,
		width: e.width,
		x: e.x,
		y: e.y,
		axisId: l
	}), /*#__PURE__*/ y.createElement(lk, {
		x: e.x,
		y: e.y,
		width: e.width,
		height: e.height,
		lowerWidth: e.width,
		upperWidth: e.width
	}, /*#__PURE__*/ y.createElement(Ck, {
		label: e.label,
		labelRef: e.labelRef
	}), e.children)));
}), lN = /*#__PURE__*/ y.forwardRef((e, t) => {
	var n = Fa(e, eN);
	return /*#__PURE__*/ y.createElement(cN, JM({}, n, { ref: t }));
});
lN.displayName = "CartesianAxis";
//#endregion
//#region node_modules/recharts/es6/theme/RechartsThemeContext.js
var uN = /*#__PURE__*/ (0, y.createContext)({ grid: {
	stroke: "#ccc",
	fill: "none"
} });
uN.Provider;
var dN = () => (0, y.useContext)(uN), fN = [
	"x1",
	"y1",
	"x2",
	"y2",
	"key"
], pN = ["offset"], mN = ["xAxisId", "yAxisId"], hN = ["xAxisId", "yAxisId"];
function gN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function _N(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? gN(Object(n), !0).forEach(function(t) {
			vN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function vN(e, t, n) {
	return (t = yN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function yN(e) {
	var t = bN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function bN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function xN() {
	return xN = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, xN.apply(null, arguments);
}
function SN(e, t) {
	if (e == null) return {};
	var n, r, i = CN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function CN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var wN = (e) => {
	var t = e.fill;
	if (!t || t === "none") return null;
	var n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.ry;
	return /*#__PURE__*/ y.createElement("rect", {
		x: r,
		y: i,
		ry: s,
		width: a,
		height: o,
		stroke: "none",
		fill: t,
		fillOpacity: n,
		className: "recharts-cartesian-grid-bg"
	});
};
function TN(e) {
	var t = e.option, n = e.lineItemProps, r;
	if (/*#__PURE__*/ y.isValidElement(t)) r = /*#__PURE__*/ y.cloneElement(t, n);
	else if (typeof t == "function") r = t(n);
	else {
		var i = n.x1, a = n.y1, o = n.x2, s = n.y2, c = n.key, l = jr(SN(n, fN)) ?? {};
		l.offset;
		var u = SN(l, pN), d = Array.isArray(u.strokeDasharray) ? u.strokeDasharray.join(",") : u.strokeDasharray;
		r = /*#__PURE__*/ y.createElement("line", xN({}, u, {
			strokeDasharray: d,
			x1: i,
			y1: a,
			x2: o,
			y2: s,
			fill: "none",
			key: c
		}));
	}
	return r;
}
function EN(e) {
	var t = e.x, n = e.width, r = e.horizontal, i = r === void 0 || r, a = e.horizontalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = SN(e, mN), s = a.map((e, r) => {
		var a = _N(_N({}, o), {}, {
			x1: t,
			y1: e,
			x2: t + n,
			y2: e,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ y.createElement(TN, {
			key: `line-${r}`,
			option: i,
			lineItemProps: a
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid-horizontal" }, s);
}
function DN(e) {
	var t = e.y, n = e.height, r = e.vertical, i = r === void 0 || r, a = e.verticalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = SN(e, hN), s = a.map((e, r) => {
		var a = _N(_N({}, o), {}, {
			x1: e,
			y1: t,
			x2: e,
			y2: t + n,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ y.createElement(TN, {
			option: i,
			lineItemProps: a,
			key: `line-${r}`
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid-vertical" }, s);
}
function ON(e) {
	var t = e.horizontalFill, n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.horizontalPoints, c = e.horizontal;
	if (!(c === void 0 || c) || !t || !t.length || s == null) return null;
	var l = s.map((e) => Math.round(e + i - i)).sort((e, t) => e - t);
	i !== l[0] && l.unshift(0);
	var u = l.map((e, s) => {
		var c = l[s + 1], u = c == null ? i + o - e : c - e;
		if (u <= 0) return null;
		var d = s % t.length;
		return /*#__PURE__*/ y.createElement("rect", {
			key: `react-${s}`,
			y: e,
			x: r,
			height: u,
			width: a,
			stroke: "none",
			fill: t[d],
			fillOpacity: n,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-gridstripes-horizontal" }, u);
}
function kN(e) {
	var t = e.vertical, n = t === void 0 || t, r = e.verticalFill, i = e.fillOpacity, a = e.x, o = e.y, s = e.width, c = e.height, l = e.verticalPoints;
	if (!n || !r || !r.length) return null;
	var u = l.map((e) => Math.round(e + a - a)).sort((e, t) => e - t);
	a !== u[0] && u.unshift(0);
	var d = u.map((e, t) => {
		var n = u[t + 1], l = n == null ? a + s - e : n - e;
		if (l <= 0) return null;
		var d = t % r.length;
		return /*#__PURE__*/ y.createElement("rect", {
			key: `react-${t}`,
			x: e,
			y: o,
			width: l,
			height: c,
			stroke: "none",
			fill: r[d],
			fillOpacity: i,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-gridstripes-vertical" }, d);
}
var AN = (e, t) => {
	var n = e.xAxis, r = e.width, i = e.height, a = e.offset;
	return Ku(jM(_N(_N(_N({}, eN), n), {}, {
		ticks: qu(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.left, a.left + a.width, t);
}, jN = (e, t) => {
	var n = e.yAxis, r = e.width, i = e.height, a = e.offset;
	return Ku(jM(_N(_N(_N({}, eN), n), {}, {
		ticks: qu(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.top, a.top + a.height, t);
}, MN = {
	horizontal: !0,
	vertical: !0,
	horizontalPoints: [],
	verticalPoints: [],
	verticalFill: [],
	horizontalFill: [],
	xAxisId: 0,
	yAxisId: 0,
	syncWithTicks: !1,
	zIndex: Fg.grid
};
function NN(e) {
	var t = ff(), n = pf(), r = df(), i = _N(_N({}, Fa(e, MN)), {}, {
		x: B(e.x) ? e.x : r.left,
		y: B(e.y) ? e.y : r.top,
		width: B(e.width) ? e.width : r.width,
		height: B(e.height) ? e.height : r.height
	}), a = i.xAxisId, o = i.yAxisId, s = i.x, c = i.y, l = i.width, u = i.height, d = i.syncWithTicks, f = i.horizontalValues, p = i.verticalValues, m = Ed(), h = U((e) => uw(e, "xAxis", a, m)), g = U((e) => uw(e, "yAxis", o, m)), _ = dN(), v = {
		stroke: i.stroke ?? _.grid.stroke,
		strokeWidth: i.strokeWidth ?? _.grid.strokeWidth,
		strokeOpacity: i.strokeOpacity ?? _.grid.strokeOpacity,
		strokeDasharray: i.strokeDasharray ?? _.grid.strokeDasharray
	};
	if (!Lu(l) || !Lu(u) || !B(s) || !B(c)) return null;
	var b = i.verticalCoordinatesGenerator || AN, x = i.horizontalCoordinatesGenerator || jN, S = i.horizontalPoints, C = i.verticalPoints;
	if ((!S || !S.length) && typeof x == "function") {
		var w = f && f.length, T = x({
			yAxis: g ? _N(_N({}, g), {}, { ticks: w ? f : g.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, w ? !0 : d);
		Md(Array.isArray(T), `horizontalCoordinatesGenerator should return Array but instead it returned [${typeof T}]`), Array.isArray(T) && (S = T);
	}
	if ((!C || !C.length) && typeof b == "function") {
		var E = p && p.length, D = b({
			xAxis: h ? _N(_N({}, h), {}, { ticks: E ? p : h.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, E ? !0 : d);
		Md(Array.isArray(D), `verticalCoordinatesGenerator should return Array but instead it returned [${typeof D}]`), Array.isArray(D) && (C = D);
	}
	return /*#__PURE__*/ y.createElement(zE, { zIndex: i.zIndex }, /*#__PURE__*/ y.createElement("g", { className: "recharts-cartesian-grid" }, /*#__PURE__*/ y.createElement(wN, {
		fill: i.fill ?? _.grid.fill,
		fillOpacity: i.fillOpacity ?? _.grid.fillOpacity,
		x: i.x,
		y: i.y,
		width: i.width,
		height: i.height,
		ry: i.ry
	}), /*#__PURE__*/ y.createElement(ON, xN({}, i, { horizontalPoints: S })), /*#__PURE__*/ y.createElement(kN, xN({}, i, { verticalPoints: C })), /*#__PURE__*/ y.createElement(EN, xN({}, i, v, {
		offset: r,
		horizontalPoints: S,
		xAxis: h,
		yAxis: g
	})), /*#__PURE__*/ y.createElement(DN, xN({}, i, v, {
		offset: r,
		verticalPoints: C,
		xAxis: h,
		yAxis: g
	}))));
}
NN.displayName = "CartesianGrid";
//#endregion
//#region node_modules/recharts/es6/cartesian/LineDrawShape.js
var PN = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"visibleLength",
	"strokeDasharray",
	"connectNulls"
];
function FN() {
	return FN = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, FN.apply(null, arguments);
}
function IN(e, t) {
	if (e == null) return {};
	var n, r, i = LN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function LN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function RN(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function zN(e, t) {
	return `${t}px ${e}px`;
}
function BN(e) {
	return e.length % 2 == 0 ? e : [...e, ...e];
}
function VN(e, t) {
	for (var n = [], r = 0; r < t; ++r) n.push(...e);
	return n;
}
function HN(e, t, n) {
	var r = BN(n), i = r.reduce((e, t) => e + t, 0);
	if (!i) return zN(t, e);
	for (var a = Math.floor(e / i), o = e % i, s = [], c = 0, l = 0; c < r.length; l += (u = r[c]) ?? 0, ++c) {
		var u, d = r[c];
		if (d != null && l + d > o) {
			s = [...r.slice(0, c), o - l];
			break;
		}
	}
	var f = s.length % 2 == 0 ? [0, t] : [t];
	return [
		...VN(r, a),
		...s,
		...f
	].map((e) => `${e}px`).join(", ");
}
function UN(e, t, n) {
	return e ? HN(n, t, `${e}`.split(/[,\s]+/gim).map((e) => parseFloat(e))) : zN(t, n);
}
function WN(e) {
	e.animationElapsedTime, e.isAnimating, e.isEntrance;
	var t = e.visibleLength, n = e.strokeDasharray, r = e.connectNulls, i = IN(e, PN), a = r ?? !1, o;
	if (t != null) {
		var s = i.pathRef;
		o = UN(n, RN(s?.current ?? null), t);
	} else n != null && (o = String(n));
	return /*#__PURE__*/ y.createElement(qp, FN({}, i, {
		connectNulls: a,
		strokeDasharray: o
	}));
}
//#endregion
//#region node_modules/recharts/es6/cartesian/useAnimatedLineLength.js
function GN(e) {
	var t = (0, y.useRef)(0), n = (0, y.useRef)(0), r = (0, y.useRef)(!1), i = (0, y.useRef)(e);
	return i.current !== e && (t.current = n.current, i.current = e), (0, y.useCallback)((e, i) => {
		if (r.current) return null;
		var a = Math.min(ni(t.current + e * i), i);
		return e > 0 && i > 0 && (n.current = Math.max(n.current, a), a >= i) ? (r.current = !0, null) : a;
	}, []);
}
//#endregion
//#region node_modules/recharts/es6/state/errorBarSlice.js
var KN = Hl({
	name: "errorBars",
	initialState: {},
	reducers: {
		addErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] || (e[r] = []), e[r].push(i);
		},
		replaceErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.prev, a = n.next;
			e[r] && (e[r] = e[r].map((e) => e.dataKey === i.dataKey && e.direction === i.direction ? a : e));
		},
		removeErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] && (e[r] = e[r].filter((e) => e.dataKey !== i.dataKey || e.direction !== i.direction));
		}
	}
}), qN = KN.actions;
qN.addErrorBar, qN.replaceErrorBar, qN.removeErrorBar;
var JN = KN.reducer, YN = ["children"];
function XN(e, t) {
	if (e == null) return {};
	var n, r, i = ZN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ZN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var QN = /*#__PURE__*/ (0, y.createContext)({
	data: [],
	xAxisId: "xAxis-0",
	yAxisId: "yAxis-0",
	dataPointFormatter: () => ({
		x: 0,
		y: 0,
		value: 0
	}),
	errorBarOffset: 0
});
function $N(e) {
	var t = e.children, n = XN(e, YN);
	return /*#__PURE__*/ y.createElement(QN.Provider, { value: n }, t);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
function eP(e, t) {
	var n = U((t) => fS(t, e)), r = U((e) => hS(e, t)), i = n?.allowDataOverflow ?? uS.allowDataOverflow, a = r?.allowDataOverflow ?? pS.allowDataOverflow;
	return {
		needClip: i || a,
		needClipX: i,
		needClipY: a
	};
}
function tP(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.clipPathId, i = vj(), a = eP(t, n), o = a.needClipX, s = a.needClipY, c = a.needClip, l = U((e) => zC(e, t, !1)), u = U((e) => BC(e, n, !1));
	if (!c || !i) return null;
	var d = i.x, f = i.y, p = i.width, m = i.height, h = o && l ? Math.min(l[0], l[1]) : d - p / 2, g = s && u ? Math.min(u[0], u[1]) : f - m / 2, _ = o && l ? Math.abs(l[1] - l[0]) : p * 2, v = s && u ? Math.abs(u[1] - u[0]) : m * 2;
	return /*#__PURE__*/ y.createElement("clipPath", { id: `clipPath-${r}` }, /*#__PURE__*/ y.createElement("rect", {
		x: h,
		y: g,
		width: _,
		height: v
	}));
}
//#endregion
//#region node_modules/recharts/es6/state/selectors/lineSelectors.js
var nP = (e, t, n, r) => pw(e, "xAxis", t, r), rP = (e, t, n, r) => fw(e, "xAxis", t, r), iP = (e, t, n, r) => pw(e, "yAxis", n, r), aP = (e, t, n, r) => fw(e, "yAxis", n, r), oP = W([
	mf,
	nP,
	iP,
	rP,
	aP
], (e, t, n, r, i) => Gu(e, "xAxis") ? ed(t, r, !1) : ed(n, i, !1)), sP = (e, t, n, r, i) => i;
function cP(e) {
	return e.type === "line";
}
var lP = W([
	mf,
	nP,
	iP,
	rP,
	aP,
	W([CS, sP], (e, t) => e.filter(cP).find((e) => e.id === t)),
	oP,
	eg
], (e, t, n, r, i, a, o, s) => {
	var c = s.chartData, l = s.dataStartIndex, u = s.dataEndIndex;
	if (!(a == null || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || o == null || e !== "horizontal" && e !== "vertical")) {
		var d = a.dataKey, f = a.data, p = f != null && f.length > 0 ? f : c?.slice(l, u + 1);
		if (p != null) return FP({
			layout: e,
			xAxis: t,
			yAxis: n,
			xAxisTicks: r,
			yAxisTicks: i,
			dataKey: d,
			bandSize: o,
			displayedData: p
		});
	}
});
//#endregion
//#region node_modules/recharts/es6/util/getRadiusAndStrokeWidthFromDot.js
function uP(e) {
	var t = Mr(e), n = 3, r = 2;
	if (t != null) {
		var i = t.r, a = t.strokeWidth, o = Number(i), s = Number(a);
		return (Number.isNaN(o) || o < 0) && (o = n), (Number.isNaN(s) || s < 0) && (s = r), {
			r: o,
			strokeWidth: s
		};
	}
	return {
		r: n,
		strokeWidth: r
	};
}
//#endregion
//#region node_modules/recharts/es6/cartesian/Line.js
var dP = ["id"], fP = [
	"type",
	"layout",
	"connectNulls",
	"needClip",
	"shape",
	"strokeDasharray"
], pP = [
	"activeDot",
	"animateNewValues",
	"animationBegin",
	"animationDuration",
	"animationEasing",
	"connectNulls",
	"dot",
	"hide",
	"isAnimationActive",
	"label",
	"legendType",
	"xAxisId",
	"yAxisId",
	"id"
];
function mP() {
	return mP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, mP.apply(null, arguments);
}
function hP(e, t) {
	if (e == null) return {};
	var n, r, i = gP(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function gP(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function _P(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function vP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? _P(Object(n), !0).forEach(function(t) {
			yP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _P(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function yP(e, t, n) {
	return (t = bP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function bP(e) {
	var t = xP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function xP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function SP(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function CP(e) {
	var t = 0, n = 0;
	for (var r of e) r.status === "matched" && r.prev.x != null && r.next.x != null && (t += r.next.x - r.prev.x, n++);
	return n > 0 ? t / n : 0;
}
var wP = {
	activeDot: !0,
	animateNewValues: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationInterpolateFn: (e, t) => {
		if (e == null) return [];
		if (t === 1) return e.flatMap((e) => e.status === "removed" ? [] : [e.next]);
		var n = CP(e), r = [];
		for (var i of e) if (i.status === "matched") r.push(vP(vP({}, i.next), {}, {
			x: fi(i.prev.x, i.next.x, t),
			y: fi(i.prev.y, i.next.y, t)
		}));
		else if (i.status === "added") {
			if (i.next.x != null) {
				var a = i.next.x - n;
				r.push(vP(vP({}, i.next), {}, {
					x: fi(a, i.next.x, t),
					y: i.next.y
				}));
			} else r.push(i.next);
		} else if (i.status === "removed" && i.prev.x != null) {
			var o = i.prev.x + n;
			r.push(vP(vP({}, i.prev), {}, {
				x: fi(i.prev.x, o, t),
				y: i.prev.y
			}));
		}
		return r;
	},
	animationMatchBy: lA,
	connectNulls: !1,
	dot: !0,
	fill: "#fff",
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "line",
	shape: WN,
	stroke: "#3182bd",
	strokeWidth: 1,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Fg.line,
	type: "linear"
}, TP = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: nd(n, t),
		payload: e
	}];
}, EP = /*#__PURE__*/ y.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: _i,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: nd(o, t),
			hide: s,
			type: u,
			color: r,
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ y.createElement(tA, { tooltipEntrySettings: f });
});
function DP(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.dot, a = r.dataKey, o = r.needClip;
	r.id;
	var s = jr(hP(r, dP));
	return /*#__PURE__*/ y.createElement($A, {
		points: n,
		dot: i,
		className: "recharts-line-dots",
		dotClassName: "recharts-line-dot",
		dataKey: a,
		baseProps: s,
		needClip: o,
		clipPathId: t
	});
}
function OP(e) {
	var t = e.showLabels, n = e.children, r = e.points, i = (0, y.useMemo)(() => r?.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return vP(vP({}, t), {}, {
			value: e.value,
			payload: e.payload,
			viewBox: t,
			parentViewBox: void 0,
			fill: void 0
		});
	}), [r]);
	return /*#__PURE__*/ y.createElement(jk, { value: t ? i : void 0 }, n);
}
function kP(e) {
	var t = e.clipPathId, n = e.pathRef, r = e.points, i = e.props, a = e.animationElapsedTime, o = e.isAnimating, s = e.isEntrance, c = e.visibleLength, l = i.type, u = i.layout, d = i.connectNulls, f = i.needClip, p = i.shape, m = i.strokeDasharray, h = vP(vP({}, Nr(hP(i, fP))), {}, {
		fill: "none",
		className: "recharts-line-curve",
		clipPath: f ? `url(#clipPath-${t})` : void 0,
		points: r,
		type: l,
		layout: u,
		connectNulls: d,
		strokeDasharray: m ?? i.strokeDasharray,
		pathRef: n,
		animationElapsedTime: a,
		isAnimating: o,
		isEntrance: i.animateNewValues ? s : !1,
		visibleLength: c
	});
	return /*#__PURE__*/ y.createElement(y.Fragment, null, r?.length > 1 && /*#__PURE__*/ y.createElement(eA, {
		option: p,
		DefaultShape: wP.shape,
		shapeProps: h
	}), /*#__PURE__*/ y.createElement(DP, {
		points: r,
		clipPathId: t,
		props: i
	}));
}
function AP(e) {
	var t = e.clipPathId, n = e.props, r = e.pathRef, i = e.previousPointsRef, a = n.points, o = n.isAnimationActive, s = n.animationBegin, c = n.animationDuration, l = n.animationEasing, u = n.animationMatchBy, d = n.animationInterpolateFn, f = n.layout, p = SP(r.current), m = CA(n.onAnimationStart, n.onAnimationEnd), h = m.isAnimating, g = m.handleAnimationStart, _ = m.handleAnimationEnd, v = !h, b = GN(a), x = (0, y.useCallback)((e) => e > 0 && p > 0, [p]);
	return /*#__PURE__*/ y.createElement(OP, {
		points: a,
		showLabels: v
	}, n.children, /*#__PURE__*/ y.createElement(wA, {
		animationInput: a,
		animationIdPrefix: "recharts-line-",
		items: a,
		previousItemsRef: i,
		isAnimationActive: o,
		animationBegin: s,
		animationDuration: c,
		animationEasing: l,
		onAnimationStart: g,
		onAnimationEnd: _,
		animationInterpolateFn: d,
		animationMatchBy: u,
		shouldUpdatePreviousRef: x,
		layout: f
	}, (e, i, a) => {
		var o = h || i < 1, s = o ? b(i, p) : null;
		return /*#__PURE__*/ y.createElement(kP, {
			props: n,
			points: e,
			clipPathId: t,
			pathRef: r,
			animationElapsedTime: i,
			isAnimating: o,
			isEntrance: a,
			visibleLength: s
		});
	}), /*#__PURE__*/ y.createElement(Ik, { label: n.label }));
}
function jP(e) {
	var t = e.clipPathId, n = e.props, r = (0, y.useRef)(null), i = (0, y.useRef)(null);
	return /*#__PURE__*/ y.createElement(AP, {
		props: n,
		clipPathId: t,
		previousPointsRef: r,
		pathRef: i
	});
}
var MP = (e, t) => ({
	x: e.x ?? void 0,
	y: e.y ?? void 0,
	value: e.value,
	errorVal: Uu(e.payload, t)
}), NP = class extends y.Component {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.top, c = e.left, l = e.width, u = e.height, d = e.id, f = e.needClip, p = e.zIndex;
		if (t) return null;
		var m = Tr("recharts-line", i), h = d, g = uP(n), _ = g.r, v = g.strokeWidth, b = Uk(n), x = _ * 2 + v, S = f ? `url(#clipPath-${b ? "" : "dots-"}${h})` : void 0;
		return /*#__PURE__*/ y.createElement(zE, { zIndex: p }, /*#__PURE__*/ y.createElement(Wr, { className: m }, f && /*#__PURE__*/ y.createElement("defs", null, /*#__PURE__*/ y.createElement(tP, {
			clipPathId: h,
			xAxisId: a,
			yAxisId: o
		}), !b && /*#__PURE__*/ y.createElement("clipPath", { id: `clipPath-dots-${h}` }, /*#__PURE__*/ y.createElement("rect", {
			x: c - x / 2,
			y: s - x / 2,
			width: l + x,
			height: u + x
		}))), /*#__PURE__*/ y.createElement($N, {
			xAxisId: a,
			yAxisId: o,
			data: r,
			dataPointFormatter: MP,
			errorBarOffset: 0
		}, /*#__PURE__*/ y.createElement(jP, {
			props: this.props,
			clipPathId: h
		}))), /*#__PURE__*/ y.createElement(Ej, {
			activeDot: this.props.activeDot,
			points: r,
			mainColor: this.props.stroke,
			itemDataKey: this.props.dataKey,
			clipPath: S
		}));
	}
};
function PP(e) {
	var t = Fa(e, wP), n = t.activeDot, r = t.animateNewValues, i = t.animationBegin, a = t.animationDuration, o = t.animationEasing, s = t.connectNulls, c = t.dot, l = t.hide, u = t.isAnimationActive, d = t.label, f = t.legendType, p = t.xAxisId, m = t.yAxisId, h = t.id, g = hP(t, pP), _ = eP(p, m).needClip, v = vj(), b = X(), x = Ed(), S = U((e) => lP(e, p, m, x, h));
	if (b !== "horizontal" && b !== "vertical" || S == null || v == null) return null;
	var C = v.height, w = v.width, T = v.x, E = v.y;
	return /*#__PURE__*/ y.createElement(NP, mP({}, g, {
		id: h,
		connectNulls: s,
		dot: c,
		activeDot: n,
		animateNewValues: r,
		animationBegin: i,
		animationDuration: a,
		animationEasing: o,
		isAnimationActive: u,
		hide: l,
		label: d,
		legendType: f,
		xAxisId: p,
		yAxisId: m,
		points: S,
		layout: b,
		height: C,
		width: w,
		left: T,
		top: E,
		needClip: _
	}));
}
function FP(e) {
	var t = e.layout, n = e.xAxis, r = e.yAxis, i = e.xAxisTicks, a = e.yAxisTicks, o = e.dataKey, s = e.bandSize;
	return e.displayedData.map((e, c) => {
		var l = Uu(e, o);
		if (t === "horizontal") return {
			x: Xu({
				axis: n,
				ticks: i,
				bandSize: s,
				entry: e,
				index: c
			}),
			y: (mi(l) ? null : r.scale.map(l)) ?? null,
			value: l,
			payload: e
		};
		var u = mi(l) ? null : n.scale.map(l), d = Xu({
			axis: r,
			ticks: a,
			bandSize: s,
			entry: e,
			index: c
		});
		return u == null || d == null ? null : {
			x: u,
			y: d,
			value: l,
			payload: e
		};
	}).filter(Boolean);
}
function IP(e) {
	var t = Fa(e, wP), n = Ed();
	return /*#__PURE__*/ y.createElement(PA, {
		id: t.id,
		type: "line"
	}, (e) => /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(nA, { legendPayload: TP(t) }), /*#__PURE__*/ y.createElement(EP, {
		dataKey: t.dataKey,
		data: t.data,
		stroke: t.stroke,
		strokeWidth: t.strokeWidth,
		fill: t.fill,
		name: t.name,
		hide: t.hide,
		unit: t.unit,
		formatter: t.formatter,
		tooltipType: t.tooltipType,
		id: e
	}), /*#__PURE__*/ y.createElement(VA, {
		type: "line",
		id: e,
		data: t.data,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		dataKey: t.dataKey,
		hide: t.hide,
		isPanorama: n
	}), /*#__PURE__*/ y.createElement(PP, mP({}, t, { id: e }))));
}
var LP = /*#__PURE__*/ y.memo(IP, Z);
LP.displayName = "Line";
//#endregion
//#region node_modules/recharts/es6/util/axisPropsAreEqual.js
var RP = ["domain", "range"], zP = ["domain", "range"];
function BP(e, t) {
	if (e == null) return {};
	var n, r, i = VP(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function VP(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function HP(e, t) {
	return e === t ? !0 : Array.isArray(e) && e.length === 2 && Array.isArray(t) && t.length === 2 ? e[0] === t[0] && e[1] === t[1] : !1;
}
function UP(e, t) {
	if (e === t) return !0;
	var n = e.domain, r = e.range, i = BP(e, RP), a = t.domain, o = t.range, s = BP(t, zP);
	return !HP(n, a) || !HP(r, o) ? !1 : Z(i, s);
}
//#endregion
//#region node_modules/recharts/es6/cartesian/XAxis.js
var WP = ["type"], GP = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], KP = ["id", "scale"];
function qP() {
	return qP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, qP.apply(null, arguments);
}
function JP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function YP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? JP(Object(n), !0).forEach(function(t) {
			XP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : JP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function XP(e, t, n) {
	return (t = ZP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ZP(e) {
	var t = QP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function QP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function $P(e, t) {
	if (e == null) return {};
	var n, r, i = eF(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function eF(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function tF(e) {
	var t = $o(), n = (0, y.useRef)(null), r = hf(), i = e.type, a = $P(e, WP), o = zg(r, "xAxis", i), s = (0, y.useMemo)(() => {
		if (o != null) return YP(YP({}, a), {}, { type: o });
	}, [a, o]);
	return (0, y.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(sj(s)) : n.current !== s && t(cj({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(lj(n.current)), null);
	}, [t]), null;
}
var nF = (e) => {
	var t = e.xAxisId, n = e.className, r = e.height, i = e.label, a = (0, y.useRef)(null), o = (0, y.useRef)(null), s = U(wd), c = Ed(), l = $o(), u = "xAxis", d = U((e) => dw(e, u, t, c)), f = U((e) => ew(e, t)), p = U((e) => aw(e, t)), m = U((e) => dS(e, t));
	if ((0, y.useLayoutEffect)(() => {
		if (!(r !== "auto" || !f || mk(i) || /*#__PURE__*/ (0, y.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedHeight();
				Math.round(f.height) !== Math.round(n) && l(mj({
					id: t,
					height: n
				}));
			}
		}
	}, [
		d,
		f,
		l,
		i,
		t,
		r,
		m
	]), f == null || p == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = $P(e, GP);
	m.id, m.scale;
	var g = $P(m, KP);
	return /*#__PURE__*/ y.createElement(lN, qP({}, h, g, {
		ref: a,
		labelRef: o,
		x: p.x,
		y: p.y,
		width: f.width,
		height: f.height,
		className: Tr(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: d,
		axisType: u,
		axisId: t
	}));
}, rF = {
	allowDataOverflow: uS.allowDataOverflow,
	allowDecimals: uS.allowDecimals,
	allowDuplicatedCategory: uS.allowDuplicatedCategory,
	angle: uS.angle,
	axisLine: eN.axisLine,
	height: uS.height,
	hide: !1,
	includeHidden: uS.includeHidden,
	interval: uS.interval,
	label: !1,
	minTickGap: uS.minTickGap,
	mirror: uS.mirror,
	orientation: uS.orientation,
	padding: uS.padding,
	reversed: uS.reversed,
	scale: uS.scale,
	tick: uS.tick,
	tickCount: uS.tickCount,
	tickLine: eN.tickLine,
	tickSize: eN.tickSize,
	type: uS.type,
	niceTicks: uS.niceTicks,
	xAxisId: 0
}, iF = /*#__PURE__*/ y.memo((e) => {
	var t = Fa(e, rF);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(tF, {
		allowDataOverflow: t.allowDataOverflow,
		allowDecimals: t.allowDecimals,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		angle: t.angle,
		dataKey: t.dataKey,
		domain: t.domain,
		height: t.height,
		hide: t.hide,
		id: t.xAxisId,
		includeHidden: t.includeHidden,
		interval: t.interval,
		minTickGap: t.minTickGap,
		mirror: t.mirror,
		name: t.name,
		orientation: t.orientation,
		padding: t.padding,
		reversed: t.reversed,
		scale: t.scale,
		tick: t.tick,
		tickCount: t.tickCount,
		tickFormatter: t.tickFormatter,
		ticks: t.ticks,
		type: t.type,
		unit: t.unit,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ y.createElement(nF, t));
}, UP);
iF.displayName = "XAxis";
//#endregion
//#region node_modules/recharts/es6/cartesian/YAxis.js
var aF = ["type"], oF = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], sF = ["id", "scale"];
function cF() {
	return cF = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, cF.apply(null, arguments);
}
function lF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function uF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? lF(Object(n), !0).forEach(function(t) {
			dF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function dF(e, t, n) {
	return (t = fF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function fF(e) {
	var t = pF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function pF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function mF(e, t) {
	if (e == null) return {};
	var n, r, i = hF(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function hF(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function gF(e) {
	var t = $o(), n = (0, y.useRef)(null), r = hf(), i = e.type, a = mF(e, aF), o = zg(r, "yAxis", i), s = (0, y.useMemo)(() => {
		if (o != null) return uF(uF({}, a), {}, { type: o });
	}, [o, a]);
	return (0, y.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(uj(s)) : n.current !== s && t(dj({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, y.useLayoutEffect)(() => () => {
		n.current &&= (t(fj(n.current)), null);
	}, [t]), null;
}
function _F(e) {
	var t = e.yAxisId, n = e.className, r = e.width, i = e.label, a = (0, y.useRef)(null), o = (0, y.useRef)(null), s = U(wd), c = Ed(), l = $o(), u = "yAxis", d = U((e) => sw(e, t)), f = U((e) => ow(e, t)), p = U((e) => dw(e, u, t, c)), m = U((e) => mS(e, t));
	if ((0, y.useLayoutEffect)(() => {
		if (!(r !== "auto" || !d || mk(i) || /*#__PURE__*/ (0, y.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedWidth();
				Math.round(d.width) !== Math.round(n) && l(pj({
					id: t,
					width: n
				}));
			}
		}
	}, [
		p,
		d,
		l,
		i,
		t,
		r,
		m
	]), d == null || f == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = mF(e, oF);
	m.id, m.scale;
	var g = mF(m, sF);
	return /*#__PURE__*/ y.createElement(lN, cF({}, h, g, {
		ref: a,
		labelRef: o,
		x: f.x,
		y: f.y,
		tickTextProps: r === "auto" ? { width: void 0 } : { width: r },
		width: d.width,
		height: d.height,
		className: Tr(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: p,
		axisType: u,
		axisId: t
	}));
}
var vF = {
	allowDataOverflow: pS.allowDataOverflow,
	allowDecimals: pS.allowDecimals,
	allowDuplicatedCategory: pS.allowDuplicatedCategory,
	angle: pS.angle,
	axisLine: eN.axisLine,
	hide: !1,
	includeHidden: pS.includeHidden,
	interval: pS.interval,
	label: !1,
	minTickGap: pS.minTickGap,
	mirror: pS.mirror,
	orientation: pS.orientation,
	padding: pS.padding,
	reversed: pS.reversed,
	scale: pS.scale,
	tick: pS.tick,
	tickCount: pS.tickCount,
	tickLine: eN.tickLine,
	tickSize: eN.tickSize,
	type: pS.type,
	niceTicks: pS.niceTicks,
	width: pS.width,
	yAxisId: 0
}, yF = /*#__PURE__*/ y.memo((e) => {
	var t = Fa(e, vF);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(gF, {
		interval: t.interval,
		id: t.yAxisId,
		scale: t.scale,
		type: t.type,
		domain: t.domain,
		allowDataOverflow: t.allowDataOverflow,
		dataKey: t.dataKey,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		allowDecimals: t.allowDecimals,
		tickCount: t.tickCount,
		padding: t.padding,
		includeHidden: t.includeHidden,
		reversed: t.reversed,
		ticks: t.ticks,
		width: t.width,
		orientation: t.orientation,
		mirror: t.mirror,
		hide: t.hide,
		unit: t.unit,
		name: t.name,
		angle: t.angle,
		minTickGap: t.minTickGap,
		tick: t.tick,
		tickFormatter: t.tickFormatter,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ y.createElement(_F, t));
}, UP);
yF.displayName = "YAxis";
var bF = W([
	(e, t) => t,
	mf,
	t_,
	u_,
	DT,
	kT,
	cE,
	Sd
], bE);
//#endregion
//#region node_modules/recharts/es6/util/getRelativeCoordinate.js
function xF(e) {
	return "getBBox" in e.currentTarget && typeof e.currentTarget.getBBox == "function";
}
function SF(e) {
	var t = e.currentTarget.getBoundingClientRect(), n, r;
	if (xF(e)) {
		var i = e.currentTarget.getBBox();
		n = i.width > 0 ? t.width / i.width : 1, r = i.height > 0 ? t.height / i.height : 1;
	} else {
		var a = e.currentTarget;
		n = a.offsetWidth > 0 ? t.width / a.offsetWidth : 1, r = a.offsetHeight > 0 ? t.height / a.offsetHeight : 1;
	}
	var o = (e, i) => ({
		relativeX: Math.round((e - t.left) / n),
		relativeY: Math.round((i - t.top) / r)
	});
	return "touches" in e ? Array.from(e.touches).map((e) => o(e.clientX, e.clientY)) : o(e.clientX, e.clientY);
}
//#endregion
//#region node_modules/recharts/es6/state/mouseEventsMiddleware.js
var CF = bl("mouseClick"), wF = Du();
wF.startListening({
	actionCreator: CF,
	effect: (e, t) => {
		var n = e.payload, r = bF(t.getState(), SF(n));
		r?.activeIndex != null && t.dispatch(Mw({
			activeIndex: r.activeIndex,
			activeDataKey: void 0,
			activeCoordinate: r.activeCoordinate
		}));
	}
});
var TF = bl("mouseMove"), EF = Du(), DF = null, OF = null, kF = null;
EF.startListening({
	actionCreator: TF,
	effect: (e, t) => {
		var n = e.payload, r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a?.includes("mousemove");
		DF !== null && (cancelAnimationFrame(DF), DF = null), OF !== null && (typeof i != "number" || !o) && (clearTimeout(OF), OF = null), kF = SF(n);
		var s = () => {
			var e = t.getState(), n = vw(e, e.tooltip.settings.shared);
			if (!kF) DF = null, OF = null;
			else {
				if (n === "axis") {
					var r = bF(e, kF);
					r?.activeIndex == null ? t.dispatch(Aw()) : t.dispatch(jw({
						activeIndex: r.activeIndex,
						activeDataKey: void 0,
						activeCoordinate: r.activeCoordinate
					}));
				}
				DF = null, OF = null;
			}
		};
		o ? i === "raf" ? DF = requestAnimationFrame(s) : typeof i == "number" && OF === null && (OF = setTimeout(s, i)) : s();
	}
});
//#endregion
//#region node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
function AF(e, t) {
	return t instanceof HTMLElement ? `HTMLElement <${t.tagName} class="${t.className}">` : t === window ? "global.window" : e === "children" && typeof t == "object" && t ? "<<CHILDREN>>" : t;
}
//#endregion
//#region node_modules/recharts/es6/state/rootPropsSlice.js
var jF = {
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	barSize: void 0,
	className: void 0,
	maxBarSize: void 0,
	stackOffset: "none",
	syncId: void 0,
	syncMethod: "index",
	baseValue: void 0,
	reverseStackOrder: !1
}, MF = Hl({
	name: "rootProps",
	initialState: jF,
	reducers: { updateOptions: (e, t) => {
		e.accessibilityLayer = t.payload.accessibilityLayer, e.barCategoryGap = t.payload.barCategoryGap, e.barGap = t.payload.barGap ?? jF.barGap, e.barSize = t.payload.barSize, e.maxBarSize = t.payload.maxBarSize, e.stackOffset = t.payload.stackOffset, e.syncId = t.payload.syncId, e.syncMethod = t.payload.syncMethod, e.className = t.payload.className, e.baseValue = t.payload.baseValue, e.reverseStackOrder = t.payload.reverseStackOrder;
	} }
}), NF = MF.reducer, PF = MF.actions.updateOptions, FF = Hl({
	name: "polarOptions",
	initialState: null,
	reducers: { updatePolarOptions: (e, t) => e === null ? t.payload : (e.startAngle = t.payload.startAngle, e.endAngle = t.payload.endAngle, e.cx = t.payload.cx, e.cy = t.payload.cy, e.innerRadius = t.payload.innerRadius, e.outerRadius = t.payload.outerRadius, e) }
});
FF.actions.updatePolarOptions;
var IF = FF.reducer, LF = bl("keyDown"), RF = bl("focus"), zF = bl("blur"), BF = Du(), VF = null, HF = null, UF = null;
BF.startListening({
	actionCreator: LF,
	effect: (e, t) => {
		UF = e.payload, VF !== null && (cancelAnimationFrame(VF), VF = null);
		var n = t.getState().eventSettings, r = n.throttleDelay, i = n.throttledEvents, a = i === "all" || i.includes("keydown");
		HF !== null && (typeof r != "number" || !a) && (clearTimeout(HF), HF = null);
		var o = () => {
			try {
				var e = t.getState();
				if (e.rootProps.accessibilityLayer === !1) return;
				var n = e.tooltip.keyboardInteraction, r = UF;
				if (r !== "ArrowRight" && r !== "ArrowLeft" && r !== "Enter") return;
				var i = qw(n, hT(e), KS(e), wT(e)), a = i == null ? -1 : Number(i), o = !Number.isFinite(a) || a < 0, s = kT(e), c = hT(e), l = vw(e, e.tooltip.settings.shared);
				if (r === "Enter") {
					if (o) return;
					var u = pE(e, l, "hover", String(n.index));
					t.dispatch(Pw({
						active: !n.active,
						activeIndex: n.index,
						activeCoordinate: u
					}));
					return;
				}
				var d = mw(e) === "left-to-right" ? 1 : -1, f = r === "ArrowRight" ? 1 : -1, p;
				if (o) {
					var m = KS(e), h = wT(e), g = f * d, _ = (e) => ({
						active: !1,
						index: String(e),
						dataKey: void 0,
						graphicalItemId: void 0,
						coordinate: void 0
					});
					if (p = -1, g > 0) {
						for (var v = 0; v < c.length; v++) if (qw(_(v), c, m, h) != null) {
							p = v;
							break;
						}
					} else for (var y = c.length - 1; y >= 0; y--) if (qw(_(y), c, m, h) != null) {
						p = y;
						break;
					}
					if (p < 0) return;
				} else {
					p = a + f * d;
					var b = s?.length || c.length;
					if (b === 0 || p >= b || p < 0) return;
				}
				var x = pE(e, l, "hover", String(p));
				t.dispatch(Pw({
					active: !0,
					activeIndex: p.toString(),
					activeCoordinate: x
				}));
			} finally {
				VF = null, HF = null;
			}
		};
		a ? r === "raf" ? VF = requestAnimationFrame(o) : typeof r == "number" && HF === null && (o(), UF = null, HF = setTimeout(() => {
			UF ? o() : (HF = null, VF = null);
		}, r)) : o();
	}
}), BF.startListening({
	actionCreator: RF,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			if (!r.active && r.index == null) {
				var i = "0", a = pE(n, vw(n, n.tooltip.settings.shared), "hover", String(i));
				t.dispatch(Pw({
					active: !0,
					activeIndex: i,
					activeCoordinate: a
				}));
			}
		}
	}
}), BF.startListening({
	actionCreator: zF,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			r.active && t.dispatch(Pw({
				active: !1,
				activeIndex: r.index,
				activeCoordinate: r.coordinate
			}));
		}
	}
});
//#endregion
//#region node_modules/recharts/es6/util/createEventProxy.js
function WF(e) {
	e.persist();
	var t = e.currentTarget;
	return new Proxy(e, { get: (e, n) => {
		if (n === "currentTarget") return t;
		var r = Reflect.get(e, n);
		return typeof r == "function" ? r.bind(e) : r;
	} });
}
//#endregion
//#region node_modules/recharts/es6/state/externalEventsMiddleware.js
var GF = bl("externalEvent"), KF = Du(), qF = /* @__PURE__ */ new Map(), JF = /* @__PURE__ */ new Map(), YF = /* @__PURE__ */ new Map();
KF.startListening({
	actionCreator: GF,
	effect: (e, t) => {
		var n = e.payload, r = n.handler, i = n.reactEvent;
		if (r != null) {
			var a = i.type, o = WF(i);
			YF.set(a, {
				handler: r,
				reactEvent: o
			});
			var s = qF.get(a);
			s !== void 0 && (cancelAnimationFrame(s), qF.delete(a));
			var c = t.getState().eventSettings, l = c.throttleDelay, u = c.throttledEvents, d = u === "all" || u?.includes(a), f = JF.get(a);
			f !== void 0 && (typeof l != "number" || !d) && (clearTimeout(f), JF.delete(a));
			var p = () => {
				var e = YF.get(a);
				try {
					if (!e) return;
					var n = e.handler, r = e.reactEvent, i = t.getState(), o = {
						activeCoordinate: zT(i),
						activeDataKey: IT(i),
						activeIndex: PT(i),
						activeLabel: FT(i),
						activeTooltipIndex: PT(i),
						isTooltipActive: BT(i)
					};
					n && n(o, r);
				} finally {
					qF.delete(a), JF.delete(a), YF.delete(a);
				}
			};
			if (!d) p();
			else if (l === "raf") {
				var m = requestAnimationFrame(p);
				qF.set(a, m);
			} else if (typeof l == "number") {
				if (!JF.has(a)) {
					p();
					var h = setTimeout(p, l);
					JF.set(a, h);
				}
			} else p();
		}
	}
});
var XF = W([
	W([Zw], (e) => e.tooltipItemPayloads),
	(e, t) => t,
	(e, t, n) => n
], (e, t, n) => {
	if (t != null) {
		var r = e.find((e) => e.settings.graphicalItemId === n);
		if (r != null) {
			var i = r.getPosition;
			if (i != null) return i(t);
		}
	}
}), ZF = bl("touchMove"), QF = Du(), $F = null, eI = null, tI = null, nI = null;
QF.startListening({
	actionCreator: ZF,
	effect: (e, t) => {
		var n = e.payload;
		if (n.touches != null && n.touches.length !== 0) {
			nI = WF(n);
			var r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a.includes("touchmove");
			$F !== null && (cancelAnimationFrame($F), $F = null), eI !== null && (typeof i != "number" || !o) && (clearTimeout(eI), eI = null), tI = Array.from(n.touches).map((e) => SF({
				clientX: e.clientX,
				clientY: e.clientY,
				currentTarget: n.currentTarget
			}));
			var s = () => {
				if (nI != null) {
					var e = t.getState(), n = vw(e, e.tooltip.settings.shared);
					if (n === "axis") {
						var r = tI?.[0];
						if (r == null) {
							$F = null, eI = null;
							return;
						}
						var i = bF(e, r);
						i?.activeIndex != null && t.dispatch(jw({
							activeIndex: i.activeIndex,
							activeDataKey: void 0,
							activeCoordinate: i.activeCoordinate
						}));
					} else if (n === "item") {
						var a = nI.touches[0];
						if (document.elementFromPoint == null || a == null) return;
						var o = document.elementFromPoint(a.clientX, a.clientY);
						if (!o || !o.getAttribute) return;
						var s = o.getAttribute(dd), c = o.getAttribute("data-recharts-item-id") ?? void 0, l = dT(e).find((e) => e.id === c);
						if (s == null || l == null || c == null) return;
						var u = l.dataKey, d = XF(e, s, c);
						t.dispatch(kw({
							activeDataKey: u,
							activeIndex: s,
							activeCoordinate: d,
							activeGraphicalItemId: c
						}));
					}
					$F = null, eI = null;
				}
			};
			o ? i === "raf" ? $F = requestAnimationFrame(s) : typeof i == "number" && eI === null && (s(), nI = null, eI = setTimeout(() => {
				nI ? s() : (eI = null, $F = null);
			}, i)) : s();
		}
	}
});
//#endregion
//#region node_modules/recharts/es6/state/eventSettingsSlice.js
var rI = {
	throttleDelay: "raf",
	throttledEvents: [
		"mousemove",
		"touchmove",
		"pointermove",
		"scroll",
		"wheel"
	]
}, iI = Hl({
	name: "eventSettings",
	initialState: rI,
	reducers: { setEventSettings: (e, t) => {
		t.payload.throttleDelay != null && (e.throttleDelay = t.payload.throttleDelay), t.payload.throttledEvents != null && (e.throttledEvents = G(t.payload.throttledEvents));
	} }
}), aI = iI.actions.setEventSettings, oI = iI.reducer, sI = Ws({
	brush: Aj,
	cartesianAxis: hj,
	chartData: uD,
	errorBars: JN,
	eventSettings: oI,
	graphicalItems: BA,
	layout: Fu,
	legend: wf,
	options: rD,
	polarAxis: Vk,
	polarOptions: IF,
	referenceElements: zj,
	renderedTicks: RM,
	rootProps: NF,
	tooltip: Fw,
	zIndex: LE
}), cI = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
	return Ml({
		reducer: sI,
		preloadedState: e,
		middleware: (e) => e({
			serializableCheck: !1,
			immutableCheck: ![
				"commonjs",
				"es6",
				"production"
			].includes("es6")
		}).concat([
			wF.middleware,
			EF.middleware,
			BF.middleware,
			KF.middleware,
			QF.middleware
		]),
		enhancers: (e) => {
			var t = e;
			return typeof e == "function" && (t = e()), t.concat(Al({ type: "raf" }));
		},
		devTools: up.devToolsEnabled && {
			serialize: { replacer: AF },
			name: `recharts-${t}`
		}
	});
};
//#endregion
//#region node_modules/recharts/es6/state/RechartsStoreProvider.js
function lI(e) {
	var t = e.preloadedState, n = e.children, r = e.reduxStoreName, i = Ed(), a = (0, y.useRef)(null);
	if (i) return n;
	a.current ??= cI(t, r);
	var o = Xo;
	return /*#__PURE__*/ y.createElement(Bf, {
		context: o,
		store: a.current
	}, n);
}
//#endregion
//#region node_modules/recharts/es6/state/ReportMainChartProps.js
function uI(e) {
	var t = e.layout, n = e.margin, r = $o(), i = Ed();
	return (0, y.useEffect)(() => {
		i || (r(Mu(t)), r(ju(n)));
	}, [
		r,
		i,
		t,
		n
	]), null;
}
var dI = /*#__PURE__*/ (0, y.memo)(uI, Z);
//#endregion
//#region node_modules/recharts/es6/state/ReportChartProps.js
function fI(e) {
	var t = $o();
	return (0, y.useEffect)(() => {
		t(PF(e));
	}, [t, e]), null;
}
var pI = /*#__PURE__*/ (0, y.memo)((e) => {
	var t = $o();
	return (0, y.useEffect)(() => {
		t(aI(e));
	}, [t, e]), null;
}, Z);
//#endregion
//#region node_modules/recharts/es6/zIndex/ZIndexPortal.js
function mI(e) {
	var t = e.zIndex, n = e.isPanorama, r = (0, y.useRef)(null), i = $o();
	return (0, y.useLayoutEffect)(() => (r.current && i(FE({
		zIndex: t,
		element: r.current,
		isPanorama: n
	})), () => {
		i(IE({
			zIndex: t,
			isPanorama: n
		}));
	}), [
		i,
		t,
		n
	]), /*#__PURE__*/ y.createElement("g", {
		tabIndex: -1,
		ref: r,
		className: `recharts-zIndex-layer_${t}`
	});
}
function hI(e) {
	var t = e.children, n = e.isPanorama, r = U(SE);
	if (!r || r.length === 0) return t;
	var i = r.filter((e) => e < 0), a = r.filter((e) => e > 0);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, i.map((e) => /*#__PURE__*/ y.createElement(mI, {
		key: e,
		zIndex: e,
		isPanorama: n
	})), t, a.map((e) => /*#__PURE__*/ y.createElement(mI, {
		key: e,
		zIndex: e,
		isPanorama: n
	})));
}
//#endregion
//#region node_modules/recharts/es6/container/RootSurface.js
var gI = ["children"];
function _I(e, t) {
	if (e == null) return {};
	var n, r, i = vI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function vI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function yI() {
	return yI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yI.apply(null, arguments);
}
var bI = {
	width: "100%",
	height: "100%",
	display: "block"
}, xI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = ff(), r = pf(), i = Mp();
	if (!Lu(n) || !Lu(r)) return null;
	var a = e.children, o = e.otherAttributes, s = e.title, c = e.desc, l, u;
	return o != null && (l = typeof o.tabIndex == "number" ? o.tabIndex : i ? 0 : void 0, u = typeof o.role == "string" ? o.role : i ? "application" : void 0), /*#__PURE__*/ y.createElement(zr, yI({}, o, {
		title: s,
		desc: c,
		role: u,
		tabIndex: l,
		width: n,
		height: r,
		style: bI,
		ref: t
	}), a);
}), SI = (e) => {
	var t = e.children, n = U(Od);
	if (!n) return null;
	var r = n.width, i = n.height, a = n.y, o = n.x;
	return /*#__PURE__*/ y.createElement(zr, {
		width: r,
		height: i,
		x: o,
		y: a
	}, t);
}, CI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = _I(e, gI);
	return Ed() ? /*#__PURE__*/ y.createElement(SI, null, /*#__PURE__*/ y.createElement(hI, { isPanorama: !0 }, n)) : /*#__PURE__*/ y.createElement(xI, yI({ ref: t }, r), /*#__PURE__*/ y.createElement(hI, { isPanorama: !1 }, n));
});
//#endregion
//#region node_modules/recharts/es6/util/useReportScale.js
function wI(e, t) {
	return kI(e) || OI(e, t) || EI(e, t) || TI();
}
function TI() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function EI(e, t) {
	if (e) {
		if (typeof e == "string") return DI(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? DI(e, t) : void 0;
	}
}
function DI(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function OI(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function kI(e) {
	if (Array.isArray(e)) return e;
}
function AI() {
	var e = $o(), t = wI((0, y.useState)(null), 2), n = t[0], r = t[1], i = U(sd);
	return (0, y.useEffect)(() => {
		if (n != null) {
			var t = n.getBoundingClientRect().width / n.offsetWidth;
			q(t) && t !== i && e(Pu(t));
		}
	}, [
		n,
		e,
		i
	]), r;
}
//#endregion
//#region node_modules/recharts/es6/chart/RechartsWrapper.js
function jI(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function MI(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? jI(Object(n), !0).forEach(function(t) {
			NI(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jI(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function NI(e, t, n) {
	return (t = PI(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function PI(e) {
	var t = FI(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function FI(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function II() {
	return II = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, II.apply(null, arguments);
}
function LI(e, t) {
	return HI(e) || VI(e, t) || zI(e, t) || RI();
}
function RI() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function zI(e, t) {
	if (e) {
		if (typeof e == "string") return BI(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? BI(e, t) : void 0;
	}
}
function BI(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function VI(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function HI(e) {
	if (Array.isArray(e)) return e;
}
var UI = () => (xD(), null);
function WI(e) {
	if (typeof e == "number") return e;
	if (typeof e == "string") {
		var t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return 0;
}
var GI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = (0, y.useRef)(null), r = LI((0, y.useState)({
		containerWidth: WI(e.style?.width),
		containerHeight: WI(e.style?.height)
	}), 2), i = r[0], a = r[1], o = (0, y.useCallback)((e, t) => {
		a((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), s = (0, y.useCallback)((e) => {
		if (typeof t == "function" && t(e), n.current != null && (n.current.disconnect(), n.current = null), e != null && typeof ResizeObserver < "u") {
			var r = e.getBoundingClientRect(), i = r.width, a = r.height;
			o(i, a);
			var s = new ResizeObserver((e) => {
				var t = e[0];
				if (t != null) {
					var n = t.contentRect, r = n.width, i = n.height;
					o(r, i);
				}
			});
			s.observe(e), n.current = s;
		}
	}, [t, o]);
	return (0, y.useEffect)(() => () => {
		n.current?.disconnect();
	}, [o]), /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(vf, {
		width: i.containerWidth,
		height: i.containerHeight
	}), /*#__PURE__*/ y.createElement("div", II({ ref: s }, e)));
}), KI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = LI((0, y.useState)({
		containerWidth: WI(n),
		containerHeight: WI(r)
	}), 2), a = i[0], o = i[1], s = (0, y.useCallback)((e, t) => {
		o((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), c = (0, y.useCallback)((e) => {
		if (typeof t == "function" && t(e), e != null) {
			var n = e.getBoundingClientRect(), r = n.width, i = n.height;
			s(r, i);
		}
	}, [t, s]);
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(vf, {
		width: a.containerWidth,
		height: a.containerHeight
	}), /*#__PURE__*/ y.createElement("div", II({ ref: c }, e)));
}), qI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(vf, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement("div", II({ ref: t }, e)));
}), JI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return typeof n == "string" || typeof r == "string" ? /*#__PURE__*/ y.createElement(KI, II({}, e, { ref: t })) : typeof n == "number" && typeof r == "number" ? /*#__PURE__*/ y.createElement(qI, II({}, e, {
		width: n,
		height: r,
		ref: t
	})) : /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(vf, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement("div", II({ ref: t }, e)));
});
function YI(e) {
	return e ? GI : JI;
}
var XI = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.children, r = e.className, i = e.height, a = e.onClick, o = e.onContextMenu, s = e.onDoubleClick, c = e.onMouseDown, l = e.onMouseEnter, u = e.onMouseLeave, d = e.onMouseMove, f = e.onMouseUp, p = e.onTouchEnd, m = e.onTouchMove, h = e.onTouchStart, g = e.style, _ = e.width, v = e.responsive, b = e.dispatchTouchEvents, x = b === void 0 || b, S = (0, y.useRef)(null), C = $o(), w = LI((0, y.useState)(null), 2), T = w[0], E = w[1], D = LI((0, y.useState)(null), 2), O = D[0], k = D[1], A = AI(), j = of(), M = j?.width > 0 ? j.width : _, N = j?.height > 0 ? j.height : i, ee = (0, y.useCallback)((e) => {
		A(e), typeof t == "function" && t(e), E(e), k(e), e != null && (S.current = e);
	}, [
		A,
		t,
		E,
		k
	]), te = (0, y.useCallback)((e) => {
		C(CF(e)), C(GF({
			handler: a,
			reactEvent: e
		}));
	}, [C, a]), ne = (0, y.useCallback)((e) => {
		C(TF(e)), C(GF({
			handler: l,
			reactEvent: e
		}));
	}, [C, l]), re = (0, y.useCallback)((e) => {
		C(Aw()), C(GF({
			handler: u,
			reactEvent: e
		}));
	}, [C, u]), ie = (0, y.useCallback)((e) => {
		C(TF(e)), C(GF({
			handler: d,
			reactEvent: e
		}));
	}, [C, d]), ae = (0, y.useCallback)(() => {
		C(RF());
	}, [C]), oe = (0, y.useCallback)(() => {
		C(zF());
	}, [C]), P = (0, y.useCallback)((e) => {
		C(LF(e.key));
	}, [C]), se = (0, y.useCallback)((e) => {
		C(GF({
			handler: o,
			reactEvent: e
		}));
	}, [C, o]), ce = (0, y.useCallback)((e) => {
		C(GF({
			handler: s,
			reactEvent: e
		}));
	}, [C, s]), le = (0, y.useCallback)((e) => {
		C(GF({
			handler: c,
			reactEvent: e
		}));
	}, [C, c]), ue = (0, y.useCallback)((e) => {
		C(GF({
			handler: f,
			reactEvent: e
		}));
	}, [C, f]), de = (0, y.useCallback)((e) => {
		C(GF({
			handler: h,
			reactEvent: e
		}));
	}, [C, h]), fe = (0, y.useCallback)((e) => {
		x && C(ZF(e)), C(GF({
			handler: m,
			reactEvent: e
		}));
	}, [
		C,
		x,
		m
	]), pe = (0, y.useCallback)((e) => {
		C(GF({
			handler: p,
			reactEvent: e
		}));
	}, [C, p]), me = YI(v);
	return /*#__PURE__*/ y.createElement(YE.Provider, { value: T }, /*#__PURE__*/ y.createElement(Di.Provider, { value: O }, /*#__PURE__*/ y.createElement(me, {
		width: M ?? g?.width,
		height: N ?? g?.height,
		className: Tr("recharts-wrapper", r),
		style: MI({
			position: "relative",
			cursor: "default",
			width: M,
			height: N
		}, g),
		onClick: te,
		onContextMenu: se,
		onDoubleClick: ce,
		onFocus: ae,
		onBlur: oe,
		onKeyDown: P,
		onMouseDown: le,
		onMouseEnter: ne,
		onMouseLeave: re,
		onMouseMove: ie,
		onMouseUp: ue,
		onTouchEnd: pe,
		onTouchMove: fe,
		onTouchStart: de,
		ref: ee
	}, /*#__PURE__*/ y.createElement(UI, null), n)));
}), ZI = [
	"width",
	"height",
	"responsive",
	"children",
	"className",
	"style",
	"compact",
	"title",
	"desc"
];
function QI(e, t) {
	if (e == null) return {};
	var n, r, i = $I(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function $I(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var eL = /*#__PURE__*/ (0, y.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = e.responsive, a = e.children, o = e.className, s = e.style, c = e.compact, l = e.title, u = e.desc, d = jr(QI(e, ZI));
	return c ? /*#__PURE__*/ y.createElement(y.Fragment, null, /*#__PURE__*/ y.createElement(vf, {
		width: n,
		height: r
	}), /*#__PURE__*/ y.createElement(CI, {
		otherAttributes: d,
		title: l,
		desc: u
	}, a)) : /*#__PURE__*/ y.createElement(XI, {
		className: o,
		style: s,
		width: n,
		height: r,
		responsive: i ?? !1,
		onClick: e.onClick,
		onMouseLeave: e.onMouseLeave,
		onMouseEnter: e.onMouseEnter,
		onMouseMove: e.onMouseMove,
		onMouseDown: e.onMouseDown,
		onMouseUp: e.onMouseUp,
		onContextMenu: e.onContextMenu,
		onDoubleClick: e.onDoubleClick,
		onTouchStart: e.onTouchStart,
		onTouchMove: e.onTouchMove,
		onTouchEnd: e.onTouchEnd
	}, /*#__PURE__*/ y.createElement(CI, {
		otherAttributes: d,
		title: l,
		desc: u,
		ref: t
	}, /*#__PURE__*/ y.createElement(qj, null, a)));
});
//#endregion
//#region node_modules/recharts/es6/chart/CartesianChart.js
function tL() {
	return tL = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, tL.apply(null, arguments);
}
function nL(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function rL(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? nL(Object(n), !0).forEach(function(t) {
			iL(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : nL(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function iL(e, t, n) {
	return (t = aL(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function aL(e) {
	var t = oL(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function oL(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var sL = rL({
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	layout: "horizontal",
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5
	},
	responsive: !1,
	reverseStackOrder: !1,
	stackOffset: "none",
	syncMethod: "index"
}, rI), cL = /*#__PURE__*/ (0, y.forwardRef)(function(e, t) {
	var n = Fa(e.categoricalChartProps, sL), r = e.chartName, i = e.defaultTooltipEventType, a = e.validateTooltipEventTypes, o = e.tooltipPayloadSearcher, s = e.categoricalChartProps, c = {
		chartName: r,
		defaultTooltipEventType: i,
		validateTooltipEventTypes: a,
		tooltipPayloadSearcher: o,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ y.createElement(lI, {
		preloadedState: { options: c },
		reduxStoreName: s.id ?? r
	}, /*#__PURE__*/ y.createElement(Dj, { chartData: s.data }), /*#__PURE__*/ y.createElement(dI, {
		layout: n.layout,
		margin: n.margin
	}), /*#__PURE__*/ y.createElement(pI, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ y.createElement(fI, {
		baseValue: n.baseValue,
		accessibilityLayer: n.accessibilityLayer,
		barCategoryGap: n.barCategoryGap,
		maxBarSize: n.maxBarSize,
		stackOffset: n.stackOffset,
		barGap: n.barGap,
		barSize: n.barSize,
		syncId: n.syncId,
		syncMethod: n.syncMethod,
		className: n.className,
		reverseStackOrder: n.reverseStackOrder
	}), /*#__PURE__*/ y.createElement(eL, tL({}, n, { ref: t })));
}), lL = ["axis"], uL = /*#__PURE__*/ (0, y.forwardRef)((e, t) => /*#__PURE__*/ y.createElement(cL, {
	chartName: "LineChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: lL,
	tooltipPayloadSearcher: tD,
	categoricalChartProps: e,
	ref: t
})), dL = 1e-6;
function fL(e, t) {
	let n = Number(e) * Number(t);
	if (n === 0) return 1;
	let r = Math.PI * n;
	return Math.abs(Math.sin(r) / r);
}
function pL(e, t) {
	return 20 * Math.log10(Math.max(fL(e, t), dL));
}
function mL(e, t = 4) {
	let n = Number(e) / 60;
	return Array.from({ length: t }, (e, t) => (t + 1) * n);
}
function hL(e, t = 4) {
	return Array.from({ length: t }, (t, n) => (n + 1) / Number(e));
}
function gL(e, t, n = 241) {
	let r = Array(n);
	for (let i = 0; i < n; i += 1) {
		let a = t * i / (n - 1);
		r[i] = {
			f: a,
			db: pL(a, e)
		};
	}
	return r;
}
//#endregion
//#region src/components/chartParts.jsx
var _L = {
	fill: Rn,
	fontSize: 12
}, vL = {
	fill: Rn,
	fontSize: 12
}, yL = {
	top: 12,
	right: 16,
	bottom: 8,
	left: 0
}, bL = {
	background: "var(--color-surface-2)",
	border: "1px solid var(--color-border)",
	borderRadius: 4,
	color: "var(--color-text)",
	fontSize: 13
};
function xL() {
	let e = (0, y.useSyncExternalStore)(w.subscribe, w.getTime), t = _j(), n = vj();
	if (!t || !n) return null;
	let r = t(e);
	return !Number.isFinite(r) || r < n.x - .5 || r > n.x + n.width + .5 ? null : /* @__PURE__ */ (0, M.jsx)("line", {
		x1: r,
		x2: r,
		y1: n.y,
		y2: n.y + n.height,
		stroke: zn,
		strokeWidth: 1,
		"aria-hidden": "true",
		pointerEvents: "none"
	});
}
function SL({ shape: e, cx: t, cy: n, color: r, filled: i = !0, size: a = 8 }) {
	if (!Number.isFinite(t) || !Number.isFinite(n)) return null;
	let o = a / 2, s = {
		stroke: i ? Nn : r,
		strokeWidth: i ? 1 : 2,
		fill: i ? r : "none"
	};
	if (e === "square") return /* @__PURE__ */ (0, M.jsx)("rect", {
		x: t - o,
		y: n - o,
		width: a,
		height: a,
		...s
	});
	if (e === "diamond") {
		let e = o * 1.25;
		return /* @__PURE__ */ (0, M.jsx)("polygon", {
			points: `${t},${n - e} ${t + e},${n} ${t},${n + e} ${t - e},${n}`,
			...s
		});
	}
	return e === "triangle" ? /* @__PURE__ */ (0, M.jsx)("polygon", {
		points: `${t},${n - o} ${t + o},${n + o} ${t - o},${n + o}`,
		...s
	}) : /* @__PURE__ */ (0, M.jsx)("circle", {
		cx: t,
		cy: n,
		r: o,
		...s
	});
}
function CL({ color: e, dash: t, shape: n = null, filled: r = !0, line: i = !0 }) {
	return /* @__PURE__ */ (0, M.jsxs)("svg", {
		width: "28",
		height: "12",
		viewBox: "0 0 28 12",
		"aria-hidden": "true",
		focusable: "false",
		className: "legend-swatch",
		children: [i && /* @__PURE__ */ (0, M.jsx)("line", {
			x1: "1",
			y1: "6",
			x2: "27",
			y2: "6",
			stroke: e,
			strokeWidth: "2",
			strokeDasharray: t || void 0
		}), n && /* @__PURE__ */ (0, M.jsx)(SL, {
			shape: n,
			cx: 14,
			cy: 6,
			color: e,
			filled: r,
			size: 8
		})]
	});
}
function wL(e, t, n, r = -6) {
	return function(i) {
		let { x: a, y: o, index: s } = i;
		return s !== n || !Number.isFinite(a) || !Number.isFinite(o) ? null : /* @__PURE__ */ (0, M.jsx)("text", {
			x: a - 2,
			y: o + r,
			textAnchor: "end",
			fontSize: 12,
			fill: t,
			stroke: Nn,
			strokeWidth: 1,
			paintOrder: "stroke",
			"aria-hidden": "true",
			children: e
		});
	};
}
//#endregion
//#region src/components/FilterFunctionChart.jsx
var TL = 4, EL = 361, DL = -60, OL = "var(--series-truth)", kL = (e) => e.toFixed(1);
function AL({ viewBox: e, text: t }) {
	if (!e) return null;
	let n = e.x, r = e.y;
	return /* @__PURE__ */ (0, M.jsxs)("g", {
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, M.jsx)("polygon", {
			points: `${n - 4},${r} ${n + 4},${r} ${n},${r + 8}`,
			fill: jn,
			stroke: "#000",
			strokeWidth: 1
		}), /* @__PURE__ */ (0, M.jsx)("text", {
			x: n,
			y: r - 2,
			textAnchor: "middle",
			fontSize: 12,
			fill: jn,
			stroke: "#000",
			strokeWidth: 1,
			paintOrder: "stroke",
			children: t
		})]
	});
}
var jL = (0, y.memo)(function({ tauMs: e, rpm: t, ariaLabel: n }) {
	let r = e / 1e3, i = (0, y.useMemo)(() => mL(t, TL), [t]), a = i[3] * 1.125, o = (0, y.useMemo)(() => gL(r, a, EL), [r, a]);
	return /* @__PURE__ */ (0, M.jsx)("div", {
		className: "chart-box",
		role: "img",
		"aria-label": n,
		children: /* @__PURE__ */ (0, M.jsx)(cf, {
			width: "100%",
			height: 180,
			children: /* @__PURE__ */ (0, M.jsxs)(uL, {
				data: o,
				accessibilityLayer: !1,
				margin: {
					...yL,
					top: 24
				},
				children: [
					/* @__PURE__ */ (0, M.jsx)(NN, {
						stroke: Ln,
						strokeDasharray: "2 4"
					}),
					/* @__PURE__ */ (0, M.jsx)(iF, {
						dataKey: "f",
						type: "number",
						domain: [0, a],
						ticks: i.map((e) => Math.round(e)),
						tick: _L,
						stroke: Ln,
						label: {
							value: "Frequency (Hz)",
							position: "insideBottomRight",
							offset: -4,
							...vL
						},
						height: 36
					}),
					/* @__PURE__ */ (0, M.jsx)(yF, {
						width: 56,
						domain: [DL, 0],
						allowDataOverflow: !0,
						ticks: [
							-60,
							-40,
							-20,
							0
						],
						tick: _L,
						stroke: Ln,
						label: {
							value: "Response (dB)",
							angle: -90,
							position: "insideLeft",
							offset: 12,
							...vL
						}
					}),
					i.map((e, t) => /* @__PURE__ */ (0, M.jsx)(uM, {
						x: e,
						stroke: jn,
						strokeWidth: 1,
						strokeDasharray: "4 4",
						label: /* @__PURE__ */ (0, M.jsx)(AL, { text: `${t + 1}×` })
					}, t)),
					/* @__PURE__ */ (0, M.jsx)(LP, {
						dataKey: "db",
						name: "Filter response",
						stroke: OL,
						strokeWidth: 2,
						dot: !1,
						activeDot: !1,
						isAnimationActive: !1,
						label: wL("Filter", OL, o.length - 1, 14)
					})
				]
			})
		})
	});
});
function ML({ view: e }) {
	let t = (0, y.useId)(), n = T();
	if (!e?.sensor) return null;
	let r = Math.min(Math.max(n, 0), e.n - 1), i = Number(e.sensor.tau_ms[r]), a = Number(e.sensor.rpm[r]), o = Number(e.t[r]), s = Number.isFinite(i) && i > 0 && Number.isFinite(a) && a > 0, c = s ? mL(a, TL) : [], l = s ? hL(i / 1e3, TL) : [], u = c.map(kL).join(", "), d = `Filter response versus frequency; nulls at ${l.map(kL).join(", ")} hertz match motor harmonics at ${u} hertz.`;
	return /* @__PURE__ */ (0, M.jsxs)("figure", {
		className: "chart-figure",
		role: "group",
		"aria-labelledby": t,
		children: [
			/* @__PURE__ */ (0, M.jsx)("h3", {
				id: t,
				className: "chart-title",
				children: `Ramsey filter function at t = ${o.toFixed(1)} s (dB)`
			}),
			/* @__PURE__ */ (0, M.jsxs)("ul", {
				className: "chart-legend",
				children: [/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(CL, {
						color: OL,
						dash: ""
					}), "Filter response"]
				}), /* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [/* @__PURE__ */ (0, M.jsx)(CL, {
						color: jn,
						dash: "4 4",
						shape: "triangle"
					}), "Motor harmonic k×"]
				})]
			}),
			s ? /* @__PURE__ */ (0, M.jsx)(jL, {
				tauMs: i,
				rpm: a,
				ariaLabel: d
			}) : /* @__PURE__ */ (0, M.jsx)("p", {
				className: "help chart-empty",
				children: "No sensor timing at this sample."
			}),
			s && /* @__PURE__ */ (0, M.jsx)("figcaption", {
				className: "chart-caption",
				children: `τ = ${i.toFixed(2)} ms set from ${Math.round(a)} RPM, so the nulls at k/τ land on the motor harmonics (${u} Hz).`
			})
		]
	});
}
var NL = (0, y.memo)(ML), PL = [
	["sql", "sql_nT"],
	["hl", "hl_nT"],
	["unentangled", "unentangled_nT"],
	["ghzIdeal", "ghz_ideal_nT"]
], FL = (e, t) => Array.isArray(e) && e.length === t && e.every((e) => typeof e == "number" && Number.isFinite(e));
function IL(e, t) {
	let n = String(t), r = e?.c_measured?.[n];
	if (typeof r == "number" && Number.isFinite(r)) return r;
	let i = e?.c_ideal?.[n];
	return typeof i == "number" && Number.isFinite(i) ? i : null;
}
function LL(e) {
	return Array.isArray(e?.ghz_measured_nT);
}
function RL(e) {
	if (!e || e.ok !== !0 || !Array.isArray(e.n) || e.n.length === 0) return [];
	let t = e.n.length;
	if (!e.n.every((e) => Number.isInteger(e) && e > 0)) return [];
	for (let [, n] of PL) if (!FL(e[n], t)) return [];
	let n = e.ghz_measured_nT;
	return n != null && !FL(n, t) ? [] : e.n.map((t, r) => {
		let i = { n: t };
		for (let [t, n] of PL) i[t] = e[n][r];
		return i.ghzMeasured = Array.isArray(n) ? n[r] : null, i.cUsed = IL(e, t), i;
	});
}
//#endregion
//#region src/components/GhzScalingChart.jsx
var zL = "GHZ scaling data is not in this artifact yet.", BL = "var(--color-text-muted)", VL = "var(--color-text)", HL = kn.quantum_q1.color, UL = kn.quantum_ghz4.color, WL = [
	.01,
	.02,
	.05,
	.1,
	.2,
	.5,
	1,
	2,
	5,
	10,
	20,
	50
], GL = [
	{
		key: "unentangled",
		label: "Unentangled, n qubits",
		shape: "square",
		color: HL,
		filled: !0
	},
	{
		key: "ghzIdeal",
		label: "GHZ, ideal contrast",
		shape: "circle",
		color: UL,
		filled: !1
	},
	{
		key: "ghzMeasured",
		label: "GHZ, measured contrast",
		shape: "diamond",
		color: UL,
		filled: !0
	}
], KL = (e) => Number.isFinite(e) ? e.toFixed(3) : "n/a", qL = (e) => Number.isFinite(e) ? e.toFixed(3) : "n/a";
function JL(e) {
	return function(t) {
		return /* @__PURE__ */ (0, M.jsx)(SL, {
			shape: e.shape,
			cx: t.cx,
			cy: t.cy,
			color: e.color,
			filled: e.filled
		}, t.index);
	};
}
function YL(e) {
	let t = e.flatMap((e) => [
		e.sql,
		e.hl,
		e.unentangled,
		e.ghzIdeal,
		e.ghzMeasured
	]).filter((e) => e > 0);
	return [Math.min(...t) / 1.4, Math.max(...t) * 1.4];
}
var XL = (0, y.memo)(function({ rows: e, measured: t }) {
	let n = (0, y.useMemo)(() => YL(e), [e]), r = WL.filter((e) => e >= n[0] && e <= n[1]), i = e.length - 1, a = GL.filter((e) => e.key !== "ghzMeasured" || t);
	return /* @__PURE__ */ (0, M.jsx)("div", {
		className: "chart-box",
		role: "img",
		"aria-label": "Signal error versus probe size for 1, 2 and 4 qubits against the standard quantum limit and Heisenberg limit lines. Table below.",
		children: /* @__PURE__ */ (0, M.jsx)(cf, {
			width: "100%",
			height: 200,
			children: /* @__PURE__ */ (0, M.jsxs)(uL, {
				data: e,
				accessibilityLayer: !1,
				margin: {
					...yL,
					right: 24
				},
				children: [
					/* @__PURE__ */ (0, M.jsx)(NN, {
						stroke: Ln,
						strokeDasharray: "2 4"
					}),
					/* @__PURE__ */ (0, M.jsx)(iF, {
						dataKey: "n",
						type: "number",
						scale: "log",
						domain: [.85, 4.7],
						allowDataOverflow: !0,
						ticks: [
							1,
							2,
							4
						],
						tick: _L,
						stroke: Ln,
						label: {
							value: "Probe qubits n",
							position: "insideBottomRight",
							offset: -4,
							...vL
						},
						height: 36
					}),
					/* @__PURE__ */ (0, M.jsx)(yF, {
						width: 56,
						type: "number",
						scale: "log",
						domain: n,
						allowDataOverflow: !0,
						ticks: r,
						tick: _L,
						stroke: Ln,
						tickFormatter: (e) => String(e),
						label: {
							value: "Signal RMSE (nT)",
							angle: -90,
							position: "insideLeft",
							offset: 12,
							...vL
						}
					}),
					/* @__PURE__ */ (0, M.jsx)(RD, {
						isAnimationActive: !1,
						contentStyle: bL,
						labelStyle: { color: "var(--color-text)" },
						labelFormatter: (e) => `n = ${e}`,
						formatter: (e, t) => [`${KL(e)} nT`, t]
					}),
					/* @__PURE__ */ (0, M.jsx)(LP, {
						dataKey: "sql",
						name: "SQL 1/√(n·S)",
						stroke: BL,
						strokeDasharray: "6 4",
						strokeWidth: 2,
						dot: !1,
						activeDot: !1,
						isAnimationActive: !1,
						label: wL("SQL", BL, i, -6)
					}),
					/* @__PURE__ */ (0, M.jsx)(LP, {
						dataKey: "hl",
						name: "HL 1/(n·√S)",
						stroke: VL,
						strokeDasharray: "2 3",
						strokeWidth: 2,
						dot: !1,
						activeDot: !1,
						isAnimationActive: !1,
						label: wL("HL", VL, i, 16)
					}),
					a.map((e) => /* @__PURE__ */ (0, M.jsx)(LP, {
						dataKey: e.key,
						name: e.label,
						stroke: "none",
						dot: JL(e),
						activeDot: !1,
						isAnimationActive: !1,
						connectNulls: !1
					}, e.key))
				]
			})
		})
	});
});
function ZL({ payload: e, status: t, measuredSource: n }) {
	let r = (0, y.useId)(), i = (0, y.useMemo)(() => RL(e), [e]), a = e?.ok === !0 ? e.S : null, o = i.length > 0 && LL(e), s = i.length ? IL(e, 2) : null, c = i.length ? IL(e, 4) : null, l = o ? n ?? "measured this Run" : "default model, not measured", u = a ? `GHZ scaling at S = ${a} shots` : "GHZ scaling", d;
	return d = i.length ? /* @__PURE__ */ (0, M.jsx)(XL, {
		rows: i,
		measured: o
	}) : t === "loading" ? /* @__PURE__ */ (0, M.jsx)("p", {
		className: "help chart-empty",
		children: "Computing GHZ scaling in-page…"
	}) : /* @__PURE__ */ (0, M.jsx)("p", {
		className: "help chart-empty",
		children: zL
	}), /* @__PURE__ */ (0, M.jsxs)("figure", {
		className: "chart-figure",
		role: "group",
		"aria-labelledby": r,
		children: [
			/* @__PURE__ */ (0, M.jsx)("h3", {
				id: r,
				className: "chart-title",
				children: u
			}),
			/* @__PURE__ */ (0, M.jsxs)("ul", {
				className: "chart-legend",
				children: [
					/* @__PURE__ */ (0, M.jsxs)("li", {
						className: "legend-item",
						children: [/* @__PURE__ */ (0, M.jsx)(CL, {
							color: BL,
							dash: "6 4"
						}), "SQL 1/√(n·S)"]
					}),
					/* @__PURE__ */ (0, M.jsxs)("li", {
						className: "legend-item",
						children: [/* @__PURE__ */ (0, M.jsx)(CL, {
							color: VL,
							dash: "2 3"
						}), "HL 1/(n·√S)"]
					}),
					GL.filter((e) => e.key !== "ghzMeasured" || o).map((e) => /* @__PURE__ */ (0, M.jsxs)("li", {
						className: "legend-item",
						children: [/* @__PURE__ */ (0, M.jsx)(CL, {
							color: e.color,
							line: !1,
							shape: e.shape,
							filled: e.filled
						}), e.label]
					}, e.key))
				]
			}),
			d,
			i.length > 0 && /* @__PURE__ */ (0, M.jsxs)("figcaption", {
				className: "chart-caption",
				children: [/* @__PURE__ */ (0, M.jsx)("span", { children: `Signal RMSE vs probe size n at equal qubit-shots. Gate error erodes the Heisenberg gain: measured contrast GHZ-2 ${qL(s)}, GHZ-4 ${qL(c)}.` }), /* @__PURE__ */ (0, M.jsxs)("span", {
					className: "badge-row",
					children: [
						/* @__PURE__ */ (0, M.jsx)(P, { children: "entangled probe n = 2" }),
						/* @__PURE__ */ (0, M.jsx)(P, { children: "entangled probe n = 4" }),
						/* @__PURE__ */ (0, M.jsx)(P, { children: l })
					]
				})]
			})
		]
	});
}
var QL = (0, y.memo)(ZL), $L = "baseline_ls";
function eR(e, t) {
	let n = e.est[$L]?.signal, r = e.est[t]?.signal, i = Array(e.n);
	for (let a = 0; a < e.n; a += 1) {
		let o = {
			t: e.t[a],
			truth: e.truth.anomaly[a]
		};
		n && (o[$L] = n[a]), r && (o[t] = r[a]), i[a] = o;
	}
	return i;
}
function tR(e, t) {
	let n = e.est[$L]?.signal, r = e.est[t]?.signal, i = [];
	for (let a = e.metricStartDisplayIndex; a < e.n; a += 1) {
		let o = e.truth.anomaly[a], s = { t: e.t[a] };
		n && (s[$L] = n[a] - o), r && (s[t] = r[a] - o), i.push(s);
	}
	return i;
}
function nR(e, t) {
	let n = e?.metrics?.[t]?.signal_rmse_nT;
	return typeof n == "number" && Number.isFinite(n) ? n : null;
}
var rR = (e) => e === null ? "RMSE n/a" : `RMSE ${e.toFixed(1)} nT`;
function iR(e, t) {
	return {
		truth: "reference",
		[$L]: rR(nR(e, $L)),
		[t]: rR(nR(e, t))
	};
}
function aR(e, t = 60) {
	let n = /* @__PURE__ */ new Set([0, e.jamIdx]), r = 0;
	for (let i = 0; i <= e.tEnd + 1e-9; i += t) {
		for (; r + 1 < e.n && Math.abs(e.t[r + 1] - i) <= Math.abs(e.t[r] - i);) r += 1;
		n.add(r);
	}
	return [...n].sort((e, t) => e - t);
}
//#endregion
//#region src/components/SensorPanel.jsx
var oR = (e, t) => [Number.isFinite(e) ? `${e.toFixed(1)} nT` : "n/a", t], sR = (e) => `t = ${Number(e).toFixed(1)} s`, cR = (e) => e === null ? "n/a" : e.toFixed(1);
function lR(e, t, n, r) {
	return /* @__PURE__ */ (0, M.jsx)(LP, {
		dataKey: e,
		name: t.label,
		stroke: t.color,
		strokeDasharray: t.dash || void 0,
		strokeLinecap: e === "quantum_q1" ? "round" : "butt",
		strokeWidth: 2,
		dot: !1,
		activeDot: !1,
		isAnimationActive: !1,
		connectNulls: !1,
		label: wL(t.short ?? t.label, t.color, n, r)
	}, e);
}
function uR({ rows: e, keys: t, height: n, ariaLabel: r, view: i, withTruth: a, xMin: o = 0 }) {
	let s = e.length - 1, c = [o, i.tEnd];
	return /* @__PURE__ */ (0, M.jsx)("div", {
		className: "chart-box",
		role: "img",
		"aria-label": r,
		children: /* @__PURE__ */ (0, M.jsx)(cf, {
			width: "100%",
			height: n,
			children: /* @__PURE__ */ (0, M.jsxs)(uL, {
				data: e,
				accessibilityLayer: !1,
				margin: yL,
				children: [
					/* @__PURE__ */ (0, M.jsx)(NN, {
						stroke: Ln,
						strokeDasharray: "2 4"
					}),
					/* @__PURE__ */ (0, M.jsx)(iF, {
						dataKey: "t",
						type: "number",
						domain: c,
						allowDataOverflow: !0,
						tickCount: 7,
						tick: _L,
						stroke: Ln,
						tickFormatter: k
					}),
					/* @__PURE__ */ (0, M.jsx)(yF, {
						width: 56,
						tick: _L,
						stroke: Ln,
						tickFormatter: k
					}),
					/* @__PURE__ */ (0, M.jsx)(RD, {
						isAnimationActive: !1,
						contentStyle: bL,
						labelStyle: { color: "var(--color-text)" },
						formatter: oR,
						labelFormatter: sR
					}),
					i.jamT >= o && /* @__PURE__ */ (0, M.jsx)(uM, {
						x: i.jamT,
						stroke: "#FFD166",
						strokeDasharray: "4 2"
					}),
					a && /* @__PURE__ */ (0, M.jsx)(LP, {
						dataKey: "truth",
						name: Dn.label,
						stroke: Dn.color,
						strokeWidth: 2,
						dot: !1,
						activeDot: !1,
						isAnimationActive: !1,
						label: wL("Truth", Dn.color, s, -8)
					}),
					t.map((e, t) => lR(e, kn[e], s, t === 0 ? 14 : -22)),
					/* @__PURE__ */ (0, M.jsx)(xL, {})
				]
			})
		})
	});
}
var dR = (0, y.memo)(function({ view: e, quantumKey: t }) {
	let n = (0, y.useId)(), r = (0, y.useId)(), i = [$L, t], a = kn[t]?.label ?? t, o = (0, y.useMemo)(() => eR(e, t), [e, t]), s = (0, y.useMemo)(() => tR(e, t), [e, t]), c = iR(e, t), l = Number(e.metricStartT);
	return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsxs)("figure", {
		className: "chart-figure",
		role: "group",
		"aria-labelledby": n,
		children: [
			/* @__PURE__ */ (0, M.jsx)("h3", {
				id: n,
				className: "chart-title",
				children: "Sensed field vs crustal truth (nT)"
			}),
			/* @__PURE__ */ (0, M.jsxs)("ul", {
				className: "chart-legend",
				children: [/* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [
						/* @__PURE__ */ (0, M.jsx)(CL, {
							color: Dn.color,
							dash: ""
						}),
						Dn.label,
						/* @__PURE__ */ (0, M.jsx)("span", {
							className: "rmse-badge",
							children: c.truth
						})
					]
				}), i.map((e) => /* @__PURE__ */ (0, M.jsxs)("li", {
					className: "legend-item",
					children: [
						/* @__PURE__ */ (0, M.jsx)(CL, {
							color: kn[e].color,
							dash: kn[e].dash
						}),
						kn[e].label,
						/* @__PURE__ */ (0, M.jsx)("span", {
							className: "rmse-badge",
							children: c[e]
						})
					]
				}, e))]
			}),
			/* @__PURE__ */ (0, M.jsx)(uR, {
				rows: o,
				keys: i,
				height: 180,
				view: e,
				withTruth: !0,
				ariaLabel: `Sensed magnetic field over flight time: crustal truth, baseline and ${a}. Data table below.`
			}),
			/* @__PURE__ */ (0, M.jsx)("figcaption", {
				className: "chart-caption",
				children: `RMSE after GPS loss: baseline ${cR(nR(e, $L))} nT, ${a} ${cR(nR(e, t))} nT.`
			})
		]
	}), /* @__PURE__ */ (0, M.jsxs)("figure", {
		className: "chart-figure",
		role: "group",
		"aria-labelledby": r,
		children: [
			/* @__PURE__ */ (0, M.jsx)("h3", {
				id: r,
				className: "chart-title",
				children: "Residual, sensed − truth (nT)"
			}),
			/* @__PURE__ */ (0, M.jsx)(uR, {
				rows: s,
				keys: i,
				height: 140,
				view: e,
				withTruth: !1,
				xMin: s[0]?.t ?? 0,
				ariaLabel: `Residual of baseline and ${a} against crustal truth after GPS loss.`
			}),
			/* @__PURE__ */ (0, M.jsx)("figcaption", {
				className: "chart-caption",
				children: `From t = ${k(l)} s (first map-matching window).`
			})
		]
	})] });
});
function fR({ view: e, quantumKey: t, ghz: n, ghzStatus: r, measuredSource: i }) {
	let a = (0, y.useId)();
	return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "panel sensor-panel",
		"aria-labelledby": a,
		children: [
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, M.jsx)("h2", {
					id: a,
					children: "Sensor"
				}), /* @__PURE__ */ (0, M.jsx)(P, { children: "emulated sensor" })]
			}),
			/* @__PURE__ */ (0, M.jsx)("p", {
				className: "help",
				children: "The quantum sensor is emulated: the field is injected as gate angles, not felt."
			}),
			e ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)(dR, {
				view: e,
				quantumKey: t
			}), /* @__PURE__ */ (0, M.jsx)(NL, { view: e })] }) : /* @__PURE__ */ (0, M.jsx)("p", {
				className: "chart-empty",
				children: "Loading recorded flights…"
			}),
			/* @__PURE__ */ (0, M.jsx)(QL, {
				payload: n,
				status: r,
				measuredSource: i
			})
		]
	});
}
var pR = (0, y.memo)(fR), mR = (e) => typeof e == "number" && Number.isFinite(e) ? e.toLocaleString("en-US", {
	maximumFractionDigits: 1,
	minimumFractionDigits: 1
}) : "n/a", hR = (e) => Number.isInteger(e?.accepted) && Number.isInteger(e?.windows) ? `${e.accepted} of ${e.windows}` : "n/a";
function gR({ view: e, quantumKey: t, thresholds: n, isLive: r }) {
	if (!e) return null;
	let i = Array.isArray(n) && n.length ? n[0] : null, a = i === null ? null : `pct_under_${i}`, o = r ? "this Run" : "recorded flight";
	return /* @__PURE__ */ (0, M.jsx)("div", {
		className: "table-scroll",
		children: /* @__PURE__ */ (0, M.jsxs)("table", {
			className: "data-table",
			children: [
				/* @__PURE__ */ (0, M.jsx)("caption", { children: `Position error after GPS loss (from t = ${k(e.metricStartT)} s): ${e.label}, ${o}` }),
				/* @__PURE__ */ (0, M.jsx)("thead", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: "Track"
					}),
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: "CEP50 (m)"
					}),
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: "CEP95 (m)"
					}),
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: `Under ${i ?? "n/a"} m (%)`
					}),
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: "Signal RMSE (nT)"
					}),
					/* @__PURE__ */ (0, M.jsx)("th", {
						scope: "col",
						children: "Windows accepted"
					})
				] }) }),
				/* @__PURE__ */ (0, M.jsx)("tbody", { children: An.map((n) => {
					let r = e.metrics?.[n], i = n === "dead_reckoning", o = n === t, s = kn[n]?.label ?? n;
					return /* @__PURE__ */ (0, M.jsxs)("tr", {
						className: o ? "row-current" : void 0,
						children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "row",
								children: o ? `${s} (on map)` : s
							}),
							/* @__PURE__ */ (0, M.jsx)("td", { children: mR(r?.cep50_m) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: mR(r?.cep95_m) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: a ? mR(r?.[a]) : "n/a" }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: i ? "n/a" : mR(r?.signal_rmse_nT) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: i ? "n/a" : hR(r) })
						]
					}, n);
				}) })
			]
		})
	});
}
var _R = (0, y.memo)(gR), vR = (e, t) => t.value === null || t.value === void 0 ? "n/a" : e === "matches_lost" ? t.windows === null ? String(t.value) : `${t.value} of ${t.windows}` : String(t.value);
function yR({ artifact: e }) {
	let t = (0, y.useId)(), n = (0, y.useMemo)(() => Tn(e), [e]);
	return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "comparison",
		"aria-labelledby": t,
		children: [/* @__PURE__ */ (0, M.jsx)("h3", {
			id: t,
			children: "Both scenarios, as found"
		}), n ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
			/* @__PURE__ */ (0, M.jsx)("p", {
				className: "help",
				children: `Recorded flights with the stored motor draw, S = ${e.S} shots, scored once under a rule fixed before the run. A live run does not change this table.`
			}),
			/* @__PURE__ */ (0, M.jsx)("blockquote", {
				className: "verdict-statement",
				children: /* @__PURE__ */ (0, M.jsx)("p", { children: n.statement })
			}),
			/* @__PURE__ */ (0, M.jsx)("div", {
				className: "badge-row",
				children: /* @__PURE__ */ (0, M.jsx)(P, { children: `verdict: ${n.verdict}` })
			}),
			/* @__PURE__ */ (0, M.jsx)("div", {
				className: "table-scroll",
				children: /* @__PURE__ */ (0, M.jsxs)("table", {
					className: "data-table comparison-table",
					children: [
						/* @__PURE__ */ (0, M.jsx)("caption", { children: "Navigation and signal results for both maps, as found" }),
						/* @__PURE__ */ (0, M.jsx)("thead", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [/* @__PURE__ */ (0, M.jsx)("th", {
							scope: "col",
							children: "Measure"
						}), n.columns.map((e) => /* @__PURE__ */ (0, M.jsxs)("th", {
							scope: "col",
							children: [
								/* @__PURE__ */ (0, M.jsx)("span", {
									className: "col-main",
									children: e.label
								}),
								/* @__PURE__ */ (0, M.jsx)("br", {}),
								/* @__PURE__ */ (0, M.jsx)("span", {
									className: "col-sub",
									children: e.mapLabel
								})
							]
						}, e.id))] }) }),
						n.groups.map((e) => /* @__PURE__ */ (0, M.jsxs)("tbody", { children: [/* @__PURE__ */ (0, M.jsx)("tr", {
							className: "rowgroup-head",
							children: /* @__PURE__ */ (0, M.jsx)("th", {
								scope: "rowgroup",
								colSpan: n.columns.length + 1,
								children: kn[e.estimator]?.label ?? e.estimator
							})
						}), e.rows.map((e) => /* @__PURE__ */ (0, M.jsxs)("tr", { children: [/* @__PURE__ */ (0, M.jsx)("th", {
							scope: "row",
							children: e.label
						}), e.cells.map((t, r) => /* @__PURE__ */ (0, M.jsx)("td", { children: vR(e.key, t) }, n.columns[r].id))] }, e.key))] }, e.estimator))
					]
				})
			}),
			/* @__PURE__ */ (0, M.jsxs)("details", {
				className: "comparison-rule",
				children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: "Comparison rule" }), /* @__PURE__ */ (0, M.jsx)("p", { children: n.rule })]
			})
		] }) : /* @__PURE__ */ (0, M.jsx)("p", {
			className: "help",
			children: "The scenario comparison is not in this artifact."
		})]
	});
}
var bR = (0, y.memo)(yR), xR = (e) => typeof e == "number" && Number.isFinite(e) ? e.toFixed(1) : "n/a", SR = (e) => typeof e == "number" && Number.isFinite(e) ? e.toFixed(3) : "n/a", CR = (e) => typeof e == "number" && Number.isFinite(e) ? e.toFixed(3) : "n/a", wR = (e) => Number.isFinite(Number(e)) ? Number(e).toFixed(2) : "n/a";
function TR({ view: e, i: t }) {
	let n = Number(e.t[t]).toFixed(1);
	return /* @__PURE__ */ (0, M.jsx)("th", {
		scope: "row",
		children: t === e.jamIdx ? `${n} (GPS jammed)` : n
	});
}
var ER = [
	["baseline_ls", "Baseline"],
	["quantum_q1", "Single-qubit"],
	["quantum_ghz4", "GHZ-4"]
];
function DR({ view: e, ghz: t }) {
	let n = (0, y.useMemo)(() => e ? aR(e, 60) : [], [e]), r = (0, y.useMemo)(() => RL(t), [t]);
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "text-alternatives",
		children: [
			e && /* @__PURE__ */ (0, M.jsxs)("details", { children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: `Map track data, ${e.label} (every 60 s)` }), /* @__PURE__ */ (0, M.jsx)("div", {
				className: "table-scroll",
				children: /* @__PURE__ */ (0, M.jsxs)("table", {
					className: "data-table",
					children: [
						/* @__PURE__ */ (0, M.jsx)("caption", { children: `True position and position errors: ${e.mapLabel}` }),
						/* @__PURE__ */ (0, M.jsx)("thead", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "t (s)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "True x (m)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "True y (m)"
							}),
							ER.map(([e, t]) => /* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: `${t} error (m)`
							}, e)),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "Dead reckoning error (m)"
							})
						] }) }),
						/* @__PURE__ */ (0, M.jsx)("tbody", { children: n.map((t) => /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)(TR, {
								view: e,
								i: t
							}),
							/* @__PURE__ */ (0, M.jsx)("td", { children: k(e.truth.x[t]) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: k(e.truth.y[t]) }),
							ER.map(([n]) => /* @__PURE__ */ (0, M.jsx)("td", { children: k(xn(e, n, t)) }, n)),
							/* @__PURE__ */ (0, M.jsx)("td", { children: k(Sn(e, t)) })
						] }, t)) })
					]
				})
			})] }),
			e && /* @__PURE__ */ (0, M.jsxs)("details", { children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: `Sensor data, ${e.label} (every 60 s)` }), /* @__PURE__ */ (0, M.jsx)("div", {
				className: "table-scroll",
				children: /* @__PURE__ */ (0, M.jsxs)("table", {
					className: "data-table",
					children: [
						/* @__PURE__ */ (0, M.jsx)("caption", { children: `Sensed magnetic field in nanotesla and sensor timing: ${e.mapLabel}` }),
						/* @__PURE__ */ (0, M.jsx)("thead", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "t (s)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "Truth (nT)"
							}),
							ER.map(([e, t]) => /* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: `${t} (nT)`
							}, e)),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "RPM"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "τ (ms)"
							})
						] }) }),
						/* @__PURE__ */ (0, M.jsx)("tbody", { children: n.map((t) => /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)(TR, {
								view: e,
								i: t
							}),
							/* @__PURE__ */ (0, M.jsx)("td", { children: xR(e.truth.anomaly[t]) }),
							ER.map(([n]) => /* @__PURE__ */ (0, M.jsx)("td", { children: xR(e.est[n]?.signal[t]) }, n)),
							/* @__PURE__ */ (0, M.jsx)("td", { children: k(e.sensor?.rpm?.[t]) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: wR(e.sensor?.tau_ms?.[t]) })
						] }, t)) }),
						/* @__PURE__ */ (0, M.jsx)("tfoot", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "row",
								children: "RMSE after GPS loss"
							}),
							/* @__PURE__ */ (0, M.jsx)("td", { children: "reference" }),
							ER.map(([t]) => /* @__PURE__ */ (0, M.jsx)("td", { children: xR(nR(e, t)) }, t)),
							/* @__PURE__ */ (0, M.jsx)("td", {}),
							/* @__PURE__ */ (0, M.jsx)("td", {})
						] }) })
					]
				})
			})] }),
			/* @__PURE__ */ (0, M.jsxs)("details", { children: [/* @__PURE__ */ (0, M.jsx)("summary", { children: "GHZ scaling data" }), r.length === 0 ? /* @__PURE__ */ (0, M.jsx)("p", {
				className: "help",
				children: "GHZ scaling data is not in this artifact yet."
			}) : /* @__PURE__ */ (0, M.jsx)("div", {
				className: "table-scroll",
				children: /* @__PURE__ */ (0, M.jsxs)("table", {
					className: "data-table",
					children: [
						/* @__PURE__ */ (0, M.jsx)("caption", { children: `Signal RMSE (nT) at S = ${t.S} shots per probe qubit` }),
						/* @__PURE__ */ (0, M.jsx)("thead", { children: /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "n"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "SQL (nT)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "HL (nT)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "Unentangled (nT)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "GHZ ideal (nT)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "GHZ measured (nT)"
							}),
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "col",
								children: "Contrast used"
							})
						] }) }),
						/* @__PURE__ */ (0, M.jsx)("tbody", { children: r.map((e) => /* @__PURE__ */ (0, M.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, M.jsx)("th", {
								scope: "row",
								children: e.n
							}),
							/* @__PURE__ */ (0, M.jsx)("td", { children: SR(e.sql) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: SR(e.hl) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: SR(e.unentangled) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: SR(e.ghzIdeal) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: e.ghzMeasured === null ? "not measured" : SR(e.ghzMeasured) }),
							/* @__PURE__ */ (0, M.jsx)("td", { children: CR(IL(t, e.n)) })
						] }, e.n)) })
					]
				})
			})] })
		]
	});
}
var OR = (0, y.memo)(DR), kR = null, AR = null, jR = null;
function MR(e) {
	if (!e) return;
	if (!kR) {
		AR = e;
		return;
	}
	let t = kR;
	t(""), jR !== null && cancelAnimationFrame(jR), jR = requestAnimationFrame(() => {
		jR = null, t(e);
	});
}
function NR() {
	let [e, t] = (0, y.useState)("");
	return (0, y.useEffect)(() => {
		if (kR = t, AR) {
			let e = AR;
			AR = null, MR(e);
		}
		return () => {
			kR === t && (kR = null), jR !== null && cancelAnimationFrame(jR), jR = null;
		};
	}, []), /* @__PURE__ */ (0, M.jsx)("p", {
		role: "status",
		"aria-live": "polite",
		className: "sr-only",
		children: e
	});
}
//#endregion
//#region src/bridge.js
var PR = typeof backend < "u" ? backend : globalThis.backend ?? null, FR = Promise.resolve();
function IR(e) {
	let t = FR.then(e, e);
	return FR = t.catch(() => {}), t;
}
function LR(t, ...n) {
	return IR(async () => {
		let r = e[t];
		if (!r) throw Error(`magnav.api.${t} not found`);
		return String(await r.callPromising(PR, ...n));
	});
}
async function RR(e, ...t) {
	return JSON.parse(await LR(e, ...t));
}
//#endregion
//#region src/probe.js
function zR() {
	let e = null;
	try {
		e = typeof setTimeout(() => {}, 0)?.then == "function";
	} catch {
		e = "threw";
	}
	console.log("[probe] timers", JSON.stringify({
		sameAsGlobal: typeof setTimeout == "function" && setTimeout === globalThis.setTimeout,
		nativeGlobal: String(globalThis.setTimeout).includes("[native code]"),
		returnsPromise: e,
		setIntervalType: typeof globalThis.setInterval,
		setIntervalNative: String(globalThis.setInterval).includes("[native code]")
	}));
}
function BR() {
	requestAnimationFrame(() => requestAnimationFrame(() => {
		console.log("[probe] frame", JSON.stringify({
			innerHeight: window.innerHeight,
			scrollHeight: document.documentElement.scrollHeight,
			dpr: window.devicePixelRatio
		}));
	}));
}
async function VR(e) {
	let t = 0, n = 0, r = performance.now(), i = !0, a = 0, o = (e) => {
		i && (t += 1, n = Math.max(n, e - r), r = e, a = requestAnimationFrame(o));
	};
	a = requestAnimationFrame(o);
	let s = performance.now();
	try {
		return {
			result: await e(),
			ms: Math.round(performance.now() - s),
			frames: t,
			maxGapMs: Math.round(n)
		};
	} finally {
		i = !1, cancelAnimationFrame(a);
	}
}
function HR(e) {
	return async (t, ...n) => {
		let { result: r, ms: i, frames: a, maxGapMs: o } = await VR(() => e(t, ...n));
		return t === "live_step" ? console.log("[probe] live_step", JSON.stringify({
			ms: i,
			budgetMs: n[0],
			frames: a,
			maxGapMs: o,
			stage: r?.stage ?? null,
			fitting: r?.fitting ?? null,
			windowsDone: r?.windows_done ?? null
		})) : t === "live_result" && console.log("[probe] live_result", JSON.stringify({
			ms: i,
			frames: a,
			maxGapMs: o
		})), r;
	};
}
//#endregion
//#region src/hooks/useArtifact.js
function UR() {
	let [e, t] = (0, y.useState)({
		status: "loading",
		artifact: null,
		error: null
	});
	return (0, y.useEffect)(() => {
		let e = !1, n = performance.now();
		return (async () => {
			try {
				let r = await VR(() => LR("artifact_json"));
				console.log("[probe] main_thread", JSON.stringify({
					call: "artifact_json",
					ms: r.ms,
					frames: r.frames,
					maxGapMs: r.maxGapMs
				}));
				let i = JSON.parse(r.result);
				if (i?.ok !== !0) throw Error(i?.error_type ? `${i.error_type}: ${i.error}` : String(i?.error ?? "artifact_json failed"));
				let a = pn(i.artifact);
				if (a.length) throw Error(`invalid artifact: ${a.slice(0, 3).join("; ")}`);
				console.log("[probe] artifact_load", JSON.stringify({ ms: Math.round(performance.now() - n) })), e || t({
					status: "ready",
					artifact: i.artifact,
					error: null
				});
			} catch (n) {
				console.error("[artifact] load failed", n);
				let r = n?.message ?? String(n);
				e || t({
					status: "error",
					artifact: null,
					error: r
				});
			}
		})(), () => {
			e = !0;
		};
	}, []), e;
}
//#endregion
//#region src/hooks/useLiveRun.js
function WR() {
	return new Promise((e) => {
		let t = new MessageChannel();
		t.port1.onmessage = () => {
			t.port1.close(), e();
		}, t.port2.postMessage(0);
	});
}
function GR() {
	return new Promise((e) => {
		requestAnimationFrame(() => e());
	});
}
var KR = be({
	callPy: HR(RR),
	now: () => performance.now(),
	yieldFn: WR,
	nextFrame: GR,
	validate: mn
}), qR = {
	samplesDone: 0,
	samplesTotal: 0,
	windowsDone: 0,
	windowsTotal: 0,
	stage: null
};
function JR({ hasBackend: e }) {
	let [t, n] = (0, y.useState)(!1), [r, i] = (0, y.useState)(0), [a, o] = (0, y.useState)(qR), [s, c] = (0, y.useState)(0), l = (0, y.useRef)(0);
	return (0, y.useEffect)(() => {
		if (!t) return;
		let e = null, n = -1, r = () => {
			let t = Math.floor((performance.now() - l.current) / 1e3);
			t !== n && (n = t, c(t)), e = requestAnimationFrame(r);
		};
		return e = requestAnimationFrame(r), () => {
			e !== null && cancelAnimationFrame(e);
		};
	}, [t]), {
		inFlight: t,
		stage: r,
		progress: a,
		elapsedS: s,
		start: (0, y.useCallback)(async ({ scenario: t, simulateFailure: r = !1, onStage: a, onQuantum: s, onStep: u }) => {
			if (KR.isInFlight()) throw Object.assign(/* @__PURE__ */ Error("A live run is already in progress"), { name: "Busy" });
			l.current = performance.now(), n(!0), i(0), o(qR), c(0);
			try {
				let n = await KR.start({
					scenario: t,
					hasBackend: e,
					simulateFailure: r,
					onStage: (e) => {
						i(e), a?.(e);
					},
					onQuantum: (e) => s?.(e),
					onStep: (e) => {
						o({
							samplesDone: Number(e.samples_done ?? 0),
							samplesTotal: Number(e.samples_total ?? 0),
							windowsDone: Number(e.windows_done ?? 0),
							windowsTotal: Number(e.windows_total ?? 0),
							stage: e.stage ?? null
						}), u?.(e);
					}
				});
				return console.log("[probe] live_summary", JSON.stringify({
					scenario: t,
					totalS: Math.round(n.elapsedMs) / 1e3,
					outcome: "ok",
					jobId: n.quantum?.job_id ?? null
				})), n;
			} catch (e) {
				throw console.log("[probe] live_summary", JSON.stringify({
					scenario: t,
					totalS: Math.round(e?.elapsedMs ?? 0) / 1e3,
					outcome: `${e?.name}: ${e?.message}`
				})), e;
			} finally {
				n(!1);
			}
		}, [e]),
		cancel: (0, y.useCallback)(() => KR.cancel(), [])
	};
}
//#endregion
//#region src/hooks/useReducedMotion.js
var YR = "(prefers-reduced-motion: reduce)";
function XR() {
	let [e, t] = (0, y.useState)(() => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia(YR).matches);
	return (0, y.useEffect)(() => {
		if (typeof window.matchMedia != "function") return;
		let e = window.matchMedia(YR), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/lib/announce.js
var ZR = (e) => String(Math.round(Number(e))), QR = (e) => String(e).replace(/…$/, "");
function $R(e, t = () => globalThis.performance.now()) {
	let n = null, r = () => {
		let r = t();
		return n !== null && r - n < e ? !1 : (n = r, !0);
	};
	return r.mark = () => {
		n = t();
	}, r.reset = () => {
		n = null;
	}, r;
}
var ez = (e) => `${ZR(e)} times speed`, tz = (e, t) => `Recorded flights loaded. Scenario: ${e}, ${t}. Press Run one IonQ job, or Play.`, nz = (e, t, n = !1) => `Scenario: ${e}, ${t}. ${n ? "Showing this Run's live result" : "Showing recorded replay"}.`, rz = (e) => `Run mode: ${e === "live" ? "live" : "recorded replay"}.`, iz = (e) => `Playing at ${ez(e)}.`, az = (e) => `Paused at ${ZR(e)} seconds.`, oz = (e) => `GPS jammed at ${ZR(e)} seconds. Navigating by magnetic map matching.`, sz = (e, t, n, r) => `${ZR(e)} seconds. ${t}: ${ZR(n)} metres. Baseline: ${ZR(r)} metres.`, cz = (e) => `Quantum track: ${e}.`, lz = (e, t) => `Step ${ZR(e)} of 4: ${QR(t)}.`, uz = (e) => String(e ?? "").slice(0, 8), dz = (e, t) => `IonQ job ${uz(e)} submitted, ${t}.`, fz = (e, t, n, r) => `Motor drawn: ${ZR(e)} to ${ZR(t)} RPM. GHZ-4 contrast ${Number(n).toFixed(3)}. Bits ${r}.`, pz = (e, t) => `${ZR(e)} of ${ZR(t)} samples.`, mz = (e) => `Live run finished on ${e}. Mode: computed in-page.`, hz = (e) => `Live run failed. Mode: fallback, precomputed replay of ${e}.`, gz = (e, t, n) => {
	let r = (e) => e != null && Number.isFinite(Number(e));
	return !r(t) || !r(n) ? "Replay finished." : `Replay finished. ${e}: ${ZR(t)} metres. Baseline: ${ZR(n)} metres.`;
}, _z = "baseline_ls", vz = 18e5, yz = 3e4, bz = 1e4, xz = "Draws this Run's motor from quantum random bits, measures the GHZ contrast, then flies the UAV over the selected map in your browser (up to 90 s). If anything fails, that map's recorded replay is shown.", Sz = "Needs a backend: press Run on Qollab and pick one. The recorded replays work without it.", Cz = "Recorded replay: stored motor draw, no IonQ job.", wz = (e) => `One IonQ job per Run, flown on ${e}. Press Stop, then Run on Qollab, to draw a new motor.`, Tz = (e) => `This Run's IonQ job was flown on ${e}. Showing the recorded replay here.`, Ez = (e) => `Map scenario is locked while the live run flies ${e}.`, Dz = (e, t, n) => `Live run finished in ${e} s on ${t}. Motor drawn by IonQ job ${uz(n)}.`, Oz = (e, t) => e.timeout ? `Live run took longer than 90 s. Showing the recorded replay of ${t} with its stored motor. Press Stop, then Run on Qollab, to try again.` : `Live run failed: ${e.name}: ${e.message}. Showing the recorded replay of ${t} with its stored motor. Press Stop, then Run on Qollab, to try a new job.`, kz = 1e4, Az = "The quantum sensor's filter function is a physical fact about how such sensors work; the field it filters here is injected as gate angles rather than felt; the downstream benefit equals that of a classical notch filter, achieved earlier and without consuming dynamic range.";
async function jz(e) {
	try {
		let t = e ? await RR("ghz_scaling_json", e.c1 ?? null, e.c2 ?? null, e.c4 ?? null) : await RR("ghz_scaling_json");
		return t?.ok === !0 ? {
			status: "ok",
			payload: t
		} : {
			status: "error",
			payload: null,
			error: `${t?.error_type ?? "Error"}: ${t?.error ?? "ghz_scaling_json"}`
		};
	} catch (e) {
		return {
			status: "error",
			payload: null,
			error: e?.message ?? String(e)
		};
	}
}
async function Mz(e, t) {
	try {
		let n = await RR(e);
		return n?.ok === !0 ? {
			status: "ok",
			record: t ? n[t] : n
		} : n?.error_type === "NotCaptured" ? {
			status: "missing",
			record: null
		} : {
			status: "error",
			record: null,
			error: `${n?.error_type ?? "Error"}: ${n?.error ?? e}`
		};
	} catch (e) {
		return {
			status: "error",
			record: null,
			error: e?.message ?? String(e)
		};
	}
}
var Nz, Pz = new Promise((e) => {
	Nz = e;
}), Fz = { inFlight: !1 }, Iz = "input, select, textarea, button, summary, [contenteditable]";
function Lz() {
	let { status: e, artifact: t, error: n } = UR(), r = XR(), [i, a] = (0, y.useState)(null), [o, s] = (0, y.useState)("live"), [c, l] = (0, y.useState)(null), [u, d] = (0, y.useState)(30), f = (0, y.useRef)(null), p = (0, y.useRef)(null), m = (0, y.useRef)(null), h = (0, y.useRef)(!1), g = !!PR || !1, _ = JR({ hasBackend: g }), [v, b] = (0, y.useState)("idle"), [x, S] = (0, y.useState)(null), [C, T] = (0, y.useState)({}), [E, D] = (0, y.useState)(null), [O, k] = (0, y.useState)(null), [A, j] = (0, y.useState)(null), [N, ee] = (0, y.useState)(!1), te = (0, y.useRef)(!1), [ne, re] = (0, y.useState)(null), [ie, oe] = (0, y.useState)(null), [P, se] = (0, y.useState)({
		status: "loading",
		record: null
	}), [ce, fe] = (0, y.useState)({
		status: "loading",
		payload: null
	}), F = i ?? t?.default_scenario ?? null, I = c ?? (Xt.includes(t?.default_estimator) ? t.default_estimator : "quantum_ghz4"), ge = o === "live", _e = ge ? C[F] ?? null : null, ve = (0, y.useMemo)(() => _e ? _e.scenario : t ? hn(t, F) : null, [
		t,
		F,
		_e
	]), { view: L, viewError: ye } = (0, y.useMemo)(() => {
		if (!ve) return {
			view: null,
			viewError: null
		};
		try {
			return {
				view: bn(ve),
				viewError: null
			};
		} catch (e) {
			return {
				view: null,
				viewError: e?.message ?? String(e)
			};
		}
	}, [ve]), be = (0, y.useRef)(L);
	be.current = L;
	let xe = (0, y.useRef)(I);
	xe.current = I;
	let Se = (0, y.useRef)(!1), Ce = (e) => kn[e]?.label ?? e;
	(0, y.useEffect)(() => {
		L && !Se.current && (Se.current = !0, w.load(L.t), w.seekIndex(L.n - 1), MR(tz(L.label, L.mapLabel)));
	}, [L]), (0, y.useEffect)(() => {
		w.setSpeed(u);
	}, [u]), (0, y.useEffect)(() => {
		w.setReduced(r);
	}, [r]), (0, y.useEffect)(() => {
		let e = $R(bz), t = w.getIndex(), n = w.on("play", () => {
			e.mark(), MR(iz(w.getSpeed()));
		}), r = w.on("pause", () => MR(az(w.getTime()))), i = w.on("end", () => {
			let e = be.current;
			if (!e) return;
			let t = xe.current, n = e.n - 1;
			MR(gz(Ce(t), xn(e, t, n), xn(e, _z, n)));
		}), a = w.subscribe(() => {
			let n = be.current, r = w.getIndex(), i = t;
			if (t = r, n && w.isPlaying()) {
				if (i < n.jamIdx && n.jamIdx <= r) e.mark(), MR(oz(n.jamT));
				else if (r >= n.metricStartIdx && r < n.n && e()) {
					let e = xe.current, t = xn(n, e, r);
					t !== null && MR(sz(n.t[r], Ce(e), t, xn(n, _z, r)));
				}
			}
		});
		return () => {
			n(), r(), i(), a();
		};
	}, []), (0, y.useEffect)(() => {
		zR(), BR();
	}, []), (0, y.useEffect)(() => {
		let e = !1;
		return (async () => {
			let t = await Mz("backend_info", null);
			!e && t.status === "ok" && re(t.record);
			let n = await Mz("circuit_json", "circuit");
			!e && n.status === "ok" && oe(n.record);
			let r = await Mz("hardware_json", "hardware");
			e || se(r);
			let i = await jz(null);
			i.status !== "ok" && console.error("[ghz] scaling failed", i.error), e || fe((e) => e.status === "ok" ? e : i);
		})(), () => {
			e = !0;
		};
	}, []), (0, y.useEffect)(() => {
		function e(e) {
			if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
			let t = e.target;
			if (t instanceof Element && t.closest(Iz)) return;
			let n = be.current;
			if (n) switch (e.key) {
				case " ":
				case "Spacebar":
					if (e.preventDefault(), e.repeat) break;
					w.toggle();
					break;
				case "ArrowLeft":
				case "ArrowRight":
					e.preventDefault(), w.stepWindow(e.key === "ArrowRight" ? 1 : -1);
					break;
				case "Home":
					e.preventDefault(), w.seekIndex(0);
					break;
				case "End":
					e.preventDefault(), w.seekIndex(n.n - 1);
					break;
				case "j":
				case "J": e.preventDefault(), w.seekTime(n.jamT - 5);
			}
		}
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, []), (0, y.useEffect)(() => {
		let e = performance.now(), t = e, n = null, r = () => w.isPlaying() || Fz.inFlight, i = (t) => {
			h.current || (r() ? e = t : t - e >= vz && (h.current = !0, Nz()));
		}, a = (e) => {
			n = null, !h.current && (e - t >= yz && (t = e, i(performance.now())), n = requestAnimationFrame(a));
		}, o = () => {
			e = performance.now();
		}, s = () => {
			document.visibilityState === "visible" && i(performance.now());
		};
		document.addEventListener("pointerdown", o, !0), document.addEventListener("keydown", o, !0), document.addEventListener("visibilitychange", s);
		let c = w.on("end", () => {
			e = performance.now();
		});
		return n = requestAnimationFrame(a), () => {
			document.removeEventListener("pointerdown", o, !0), document.removeEventListener("keydown", o, !0), document.removeEventListener("visibilitychange", s), c(), n !== null && cancelAnimationFrame(n);
		};
	}, []);
	let we = (0, y.useCallback)((e) => {
		let n = t ? hn(t, e) : null;
		a(e), n && MR(nz(n.label, n.map_label, o === "live" && !!C[e]));
	}, [
		t,
		o,
		C
	]), Te = (0, y.useCallback)((e) => {
		s(e), MR(rz(e));
	}, []), Ee = (0, y.useCallback)((e) => {
		l(e), MR(cz(Ce(e)));
	}, []), De = (0, y.useCallback)(async () => {
		if (te.current || !g || !t || !L) return;
		te.current = !0;
		let e = F, n = hn(t, e)?.label ?? e, i = document.activeElement, a = !!(i && p.current?.closest("fieldset")?.contains(i));
		(i === m.current || a) && f.current?.focus(), w.pause(), S(e), D(null), k(null), b("running"), Fz.inFlight = !0;
		let o = $R(kz);
		o.mark();
		try {
			let t = await _.start({
				scenario: e,
				simulateFailure: N,
				onStage: (e) => {
					e !== 2 && MR(lz(e, le[e]));
				},
				onQuantum: (e) => {
					D(e), MR(`${dz(e.job_id, e.backend)} ${fz(e.motor?.rpm_min, e.motor?.rpm_max, e.c_hat?.c4, ke(e))}`);
				},
				onStep: (e) => {
					!e.done && o() && MR(pz(e.samples_done, e.samples_total));
				}
			}), i = bn(t.result.scenario);
			D(t.quantum), T({ [e]: t.result }), j(Math.round(t.elapsedMs / 1e3)), b("result"), w.load(i.t), r ? w.seekIndex(i.n - 1) : (w.seekIndex(0), w.play()), MR(mz(n));
			let a = t.quantum?.c_hat;
			if (a && [
				a.c1,
				a.c2,
				a.c4
			].some((e) => Number.isFinite(e))) {
				let e = await jz(a);
				e.status === "ok" ? fe(e) : console.error("[ghz] measured scaling failed", e.error);
			}
		} catch (e) {
			console.error("[live] failed", e), e?.quantum && D(e.quantum), k({
				name: String(e?.name ?? "Error"),
				message: String(e?.message ?? e),
				timeout: e?.name === "TimeoutError"
			}), b("fallback"), MR(hz(n));
		} finally {
			Fz.inFlight = !1, a && document.activeElement === f.current && p.current?.focus();
		}
	}, [
		g,
		t,
		L,
		F,
		_,
		N,
		r
	]), Oe = e === "error" ? n : ye, Ae = Oe ? `Could not load the recorded flights (${Oe}). Press Stop, then Run on Qollab, to reload.` : null, je = e === "ready" && !!L, R = v === "running", Me = v !== "idle", Ne = x && t ? hn(t, x)?.label ?? x : null, Pe = F === x, Fe = !!_e, Le = Cz;
	ge && (Le = g ? !Me || R ? xz : Pe ? wz(Ne) : Tz(Ne) : Sz);
	let Re = null;
	R ? Re = de(_.stage || 1) : L && Fe && v === "result" ? Re = Dz(A, L.label, E?.job_id) : L && (Re = pe(L.label, L.jamT, ge && !Me));
	let ze = v === "fallback" && O && Ne ? Oz(O, Ne) : null, Be = E?.analytic_blocks === !0 && (R || Fe) ? ue : null, Ve = "replay";
	R ? Ve = "computing" : Fe && (Ve = "computed");
	let He = "stored";
	return R ? He = null : Fe && (He = "drawn"), /* @__PURE__ */ (0, M.jsxs)("main", {
		className: "page",
		children: [
			/* @__PURE__ */ (0, M.jsxs)("header", {
				className: "page-header",
				children: [/* @__PURE__ */ (0, M.jsx)("h1", { children: "Quantum MagNav: a UAV holding position without GPS" }), /* @__PURE__ */ (0, M.jsx)("p", {
					className: "intro",
					children: "After GPS is jammed, the UAV navigates by matching its magnetometer reading to a magnetic anomaly map; an emulated Ramsey quantum sensor and an ordinary magnetometer with a classical notch each feed the same map matcher."
				})]
			}),
			Ae && /* @__PURE__ */ (0, M.jsx)("p", {
				className: "danger-notice",
				children: Ae
			}),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "layout",
				children: [/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "col-left",
					children: [
						/* @__PURE__ */ (0, M.jsx)(vr, {
							view: L,
							quantumKey: I
						}),
						/* @__PURE__ */ (0, M.jsxs)("section", {
							className: "panel controls",
							"aria-label": "Run controls",
							children: [
								t && /* @__PURE__ */ (0, M.jsx)(yr, {
									scenarios: t.scenarios,
									value: F,
									onChange: we,
									disabled: !je || R,
									lockHelp: R && Ne ? Ez(Ne) : null,
									focusRef: p
								}),
								/* @__PURE__ */ (0, M.jsx)(xr, {
									value: o,
									onChange: Te,
									disabled: !je
								}),
								/* @__PURE__ */ (0, M.jsxs)("div", {
									className: "run-row",
									children: [
										ge && /* @__PURE__ */ (0, M.jsx)("button", {
											type: "button",
											className: "btn-primary run-button",
											ref: m,
											onClick: De,
											disabled: !je || !g || Me,
											"aria-describedby": "run-help",
											children: "Run one IonQ job"
										}),
										/* @__PURE__ */ (0, M.jsx)("p", {
											id: "run-help",
											className: "help run-help",
											children: Le
										}),
										ge && /* @__PURE__ */ (0, M.jsxs)("details", {
											className: "demo-options",
											children: [
												/* @__PURE__ */ (0, M.jsx)("summary", { children: "Demo options" }),
												/* @__PURE__ */ (0, M.jsxs)("label", {
													className: "check-row",
													children: [/* @__PURE__ */ (0, M.jsx)("input", {
														type: "checkbox",
														checked: N,
														onChange: (e) => ee(e.target.checked),
														disabled: Me
													}), "Simulate a failure"]
												}),
												/* @__PURE__ */ (0, M.jsx)("p", {
													className: "help",
													children: "Starts the live run with a forced error before any IonQ job, to show the recorded-replay fallback."
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, M.jsx)(Cr, {
									value: I,
									onChange: Ee,
									disabled: !je
								}),
								/* @__PURE__ */ (0, M.jsx)(ae, {
									view: L,
									speed: u,
									onSpeedChange: d,
									disabled: !je || R
								})
							]
						}),
						/* @__PURE__ */ (0, M.jsx)(he, {
							mode: Ve,
							motor: He,
							mapLabel: L ? L.mapLabel : null,
							fallbackLabel: ge && v === "fallback" && Pe ? Ne : null,
							bitsLabel: Fe && E ? ke(E) : null,
							message: Re,
							danger: ze,
							notice: Be,
							focusRef: f,
							children: R ? /* @__PURE__ */ (0, M.jsx)(me, {
								stage: _.stage,
								progress: _.progress,
								elapsedS: _.elapsedS,
								reduced: r
							}) : null
						}),
						/* @__PURE__ */ (0, M.jsx)(Ie, {
							storedMotor: t?.motor ?? null,
							quantum: E,
							started: Me,
							failed: v === "fallback",
							backendName: ne?.name ?? null,
							isIonq: ne?.is_ionq === !0,
							flownLabel: v === "result" ? Ne : null,
							hardware: P,
							circuitSha: ie?.circuit_sha256 ?? null,
							modelSha: C[x]?.model_sha256 ?? t?.model_sha256 ?? null
						})
					]
				}), /* @__PURE__ */ (0, M.jsx)("div", {
					className: "col-right",
					children: /* @__PURE__ */ (0, M.jsx)(pR, {
						view: L,
						quantumKey: I,
						ghz: ce.payload,
						ghzStatus: ce.status,
						measuredSource: E?.c_n_source ?? null
					})
				})]
			}),
			/* @__PURE__ */ (0, M.jsxs)("section", {
				className: "panel results",
				"aria-labelledby": "results-heading",
				children: [
					/* @__PURE__ */ (0, M.jsx)("h2", {
						id: "results-heading",
						children: "Navigation accuracy"
					}),
					/* @__PURE__ */ (0, M.jsx)(_R, {
						view: L,
						quantumKey: I,
						thresholds: t?.thresholds_m ?? null,
						isLive: Fe
					}),
					t && /* @__PURE__ */ (0, M.jsx)(bR, { artifact: t }),
					/* @__PURE__ */ (0, M.jsx)(OR, {
						view: L,
						ghz: ce.payload
					})
				]
			}),
			/* @__PURE__ */ (0, M.jsxs)("section", {
				className: "panel quantum-here",
				"aria-labelledby": "quantum-here-heading",
				children: [
					/* @__PURE__ */ (0, M.jsx)("h2", {
						id: "quantum-here-heading",
						children: "What is quantum here"
					}),
					/* @__PURE__ */ (0, M.jsxs)("ul", { children: [
						/* @__PURE__ */ (0, M.jsx)("li", { children: "One IonQ job per Run holds one circuit: single-qubit Ramsey probes, GHZ-2 and GHZ-4 blocks, and random-number qubits." }),
						/* @__PURE__ */ (0, M.jsx)("li", { children: "Its random bits draw this Run's motor, and its measured GHZ contrast sets the entangled probe's contrast in the emulator. On a simulator the bits are simulator-sampled; only a QPU run is physically random." }),
						/* @__PURE__ */ (0, M.jsx)("li", { children: "The navigation flight itself is emulated in your browser, over the map you pick." })
					] }),
					/* @__PURE__ */ (0, M.jsx)("p", {
						className: "dg-sentence",
						children: Az
					})
				]
			}),
			/* @__PURE__ */ (0, M.jsx)(NR, {}),
			/* @__PURE__ */ (0, M.jsx)("footer", { children: /* @__PURE__ */ (0, M.jsx)("p", { children: "This effort is supported by Qollab & IonQ. · Survey map: MagNav.jl Eastern_395 · Data supported by USAF FA8750-19-2-1000 · Synthetic map generated by this project from a fixed seed · MIT License" }) })
		]
	});
}
(0, v.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, M.jsx)(Lz, {})), await Pz;
//#endregion
