const stream = (options) => {
	const {start, stop, gen} = options;
	function _gen(n) { 
  	return stop(n) ? 
      { next: () => _gen(n), value: n, done: true } :
      { next: () => _gen(gen(n)), value: n, done: false }
  };
  return (_gen(start));
};

const take = n => s => { return {
	next: () => take(n - 1)(s.next()),
	value: s.value,
	done: s.done || n == 0,
}};

const fold = z => f => s => { return {
	next: () => fold(f(z, s.next().value))(f)(s.next()),
	value: z,
	done: s.done,
}};

const zip = f => (left, right) => { return {
	next: () => zip(f)(left.next(), right.next()),
	value: f(left.value, right.value),
	done: left.done || right.done,
}};

const concat = (left, right) => { return {
	next: () => left.done? right : concat(left.next(), right),
	value: left.value,
	done: left.done && right.done,
}};

const filter = f => s => { 
	const _fwd = it => f(it.value) || it.done ? it : _fwd(it.next());
	return {
		next: () => filter(f)(_fwd(s.next())),
		value: _fwd(s).value,
		done: s.done,
}};

const drop = n => s => { 
	const _fwd = n => it => n == 0 || it.done ? it : _fwd(n - 1)(it.next());
	return {
		next: () => _fwd(n)(s),
		value: _fwd(n)(s).value,
		done: s.done,
}};

const map = f => s => fold(f(s.value))((_, v) => f(v))(s);

const iter = stream => f => {
	let it = stream;
	while(!it.done) {
  	f(it.value);
	  it = it.next();
  }
}
//################################################################################

const ints = stream({ start: 0, stop:  _ => false, gen:   _ => _ + 1 });
const alpha = map(_ => String.fromCharCode(97 + _))(take(26)(ints));

const alphaInt = zip((a,b) => `${a} - ${b}`)(alpha, ints);
const zero2ten = take(11)(ints);
const first = concat(take(5)(ints), take(5)(alpha))
//const one2five = map(_ => _ + "a")(take(5)(fold(0)((a,b)=> a + b)(ints)));
//iter(zip((a,b) => `${a} - ${b}`)(ints,alpha))( _ => console.log(_));

//const five2ten = drop(5)(zero2ten);
const evenInts = filter(_ => _ % 2 == 0)(zero2ten);
iter(evenInts)( _ => console.log(_));
//iter(drop(5)(zero2ten))( _ => console.log(_));





