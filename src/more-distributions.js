// Additional catalogue entries; no external numerical dependencies.
const param = (key, label, symbol, value, min, max, step, integer = false) => ({ key, label, symbol, value, min, max, step, integer });
const location = () => param('mu', 'Location', 'μ', 0, -10, 10, .1);
const scale = () => param('scale', 'Scale', 's', 1, .1, 5, .1);
const probability = (value = .5, min = 0) => param('p', 'Success probability', 'p', value, min, 1, .01);
const ref = page => `https://www.randomservices.org/random/${page}.html`;
const normal = rng => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
// Reject the zero endpoint for inverse transforms whose quantile diverges there.
const openUniform = rng => { let u; do { u = rng(); } while (u === 0); return u; };
const geometric = (p, rng) => p === 1 ? 0 : Math.floor(Math.log1p(-rng()) / Math.log1p(-p));
const logisticCdf = z => z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
const normalCdf = z => {
  if (z === 0) return .5;
  const t = 1 / (1 + .2316419 * Math.abs(z));
  const tail = Math.exp(-z*z/2) / Math.sqrt(2*Math.PI) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - tail : tail;
};
// Lanczos approximation for positive gamma arguments used by Weibull moments.
export function gamma(z) {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  z -= 1; let x = .99999999999980993;
  coefficients.forEach((c, i) => { x += c / (z + i + 1); });
  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + .5) * Math.exp(-t) * x;
}
const negMass = (x, { r, p }) => {
  if (!Number.isInteger(x) || x < 0) return 0;
  if (p === 1) return x === 0 ? 1 : 0;
  // r is a bounded positive integer: compute only r - 1 log factors.
  let combination = 0;
  for (let i = 1; i < r; i++) combination += Math.log((x + i) / i);
  return Math.exp(combination + r * Math.log(p) + x * Math.log1p(-p));
};
const negCdf = (x, { r, p }) => {
  if (x < 0) return 0;
  if (p === 1) return 1;
  // P(failures <= k) = P(Bin(k+r,p) >= r). Sum the short complement.
  const n = Math.floor(x) + r;
  let term = Math.exp(n * Math.log1p(-p)), sum = term;
  for (let j = 1; j < r; j++) { term *= (n - j + 1) / j * p / (1-p); sum += term; }
  return Math.max(0, Math.min(1, 1-sum));
};
export const moreDistributions = [
  {
    id:'bernoulli', name:'Bernoulli', alias:'Single binary trial', type:'Discrete', color:'#638f78', notation:'Bern(p)',
    description:'One trial, two outcomes. A success is 1 and a failure is 0.',
    use:'Model a single yes/no outcome, such as a coin flip or whether a visitor converts.', tags:['Binary outcome','Single trial'],
    formula:'P(X = x) = pˣ (1 − p)¹⁻ˣ,  x ∈ {0, 1}', params:[probability()],
    density:(x,{p}) => x===0 ? 1-p : x===1 ? p : 0, cdf:(x,{p}) => x<0 ? 0 : x<1 ? 1-p : 1,
    range:() => [-.5,1.5], stats:({p}) => ({Mean:p,Variance:p*(1-p),'Std. deviation':Math.sqrt(p*(1-p)),Mode:p===.5?'0, 1':p<.5?0:1,Support:'{0, 1}',Skewness:p===0||p===1?'Undefined':(1-2*p)/Math.sqrt(p*(1-p))}),
    sample:({p},rng) => rng()<p?1:0, sourceUrl:ref('bernoulli/Introduction')
  },
  {
    id:'geometric', name:'Geometric', alias:'Failures before the first success', type:'Discrete', color:'#aa9158', notation:'Geom(p)',
    description:'Count failures before the first success in independent trials. The count starts at zero.',
    use:'Model retries before a successful request. This convention counts failures, not the total number of trials.', tags:['Memoryless','Failure counts'],
    formula:'P(X = k) = p(1 − p)ᵏ,  k = 0, 1, …', params:[probability(.3,.05)],
    density:(x,{p}) => !Number.isInteger(x)||x<0?0:p===1?(x===0?1:0):p*Math.exp(x*Math.log1p(-p)),
    cdf:(x,{p}) => x<0?0:p===1?1:-Math.expm1((Math.floor(x)+1)*Math.log1p(-p)),
    range:({p}) => [-.5,p===1?1.5:Math.max(2,Math.ceil(Math.log(.001)/Math.log1p(-p)))+.5],
    stats:({p}) => ({Mean:(1-p)/p,Variance:(1-p)/p**2,'Std. deviation':Math.sqrt(1-p)/p,Mode:0,Support:'{0, 1, 2, …}',Skewness:p===1?'Undefined':(2-p)/Math.sqrt(1-p)}),
    sample:({p},rng) => geometric(p,rng), sourceUrl:ref('bernoulli/Geometric')
  },
  {
    id:'negative_binomial',name:'Negative Binomial',alias:'Failures before r successes',type:'Discrete',color:'#9172ac',notation:'NB(r, p)',
    description:'Count failures before a fixed number of successes, with the same success probability on each trial.',
    use:'Model overdispersed counts or retries before r successes. Here r is an integer and X counts failures, starting at zero.',tags:['Overdispersion','Failure counts'],
    formula:'P(X = k) = C(k + r − 1, k) pʳ (1 − p)ᵏ',params:[param('r','Target successes','r',5,1,30,1,true),probability(.5,.1)],
    density:negMass,cdf:negCdf,range:({r,p}) => [-.5,Math.max(2,Math.ceil(r*(1-p)/p+6*Math.sqrt(r*(1-p))/p))+.5],
    stats:({r,p}) => ({Mean:r*(1-p)/p,Variance:r*(1-p)/p**2,'Std. deviation':Math.sqrt(r*(1-p))/p,Mode:r>1&&p<1&&Number.isInteger((r-1)*(1-p)/p)?`${(r-1)*(1-p)/p-1}, ${(r-1)*(1-p)/p}`:r>1?Math.floor((r-1)*(1-p)/p):0,Support:'{0, 1, 2, …}',Skewness:p===1?'Undefined':(2-p)/Math.sqrt(r*(1-p))}),
    sample:({r,p},rng) => {let s=0;for(let i=0;i<r;i++)s+=geometric(p,rng);return s;},sourceUrl:ref('bernoulli/NegativeBinomial')
  },
  {
    id:'discrete_uniform',name:'Discrete Uniform',alias:'Equally likely integers',type:'Discrete',color:'#498e96',notation:'DU(a, b)',
    description:'Every integer between the two inclusive bounds has the same probability.',use:'Fair dice, random integer choices, and equally likely outcomes on a finite set.',tags:['Bounded','Equal mass'],
    formula:'P(X = k) = 1 / (b − a + 1),  k = a, …, b',params:[param('a','Lower integer','a',1,-20,19,1,true),param('b','Upper integer','b',6,-19,20,1,true)],constraints:[{left:'a',op:'<=',right:'b',message:'Lower bound must not exceed upper bound.'}],
    density:(x,{a,b}) => Number.isInteger(x)&&x>=a&&x<=b?1/(b-a+1):0,cdf:(x,{a,b}) => Math.max(0,Math.min(1,(Math.floor(x)-a+1)/(b-a+1))),range:({a,b}) => [a-.5,b+.5],
    stats:({a,b}) => ({Mean:(a+b)/2,Variance:((b-a+1)**2-1)/12,'Std. deviation':Math.sqrt(((b-a+1)**2-1)/12),Median:(a+b)/2,Support:`{${a}, …, ${b}}`,Mode:'Every support value'}),
    sample:({a,b},rng) => a+Math.floor((b-a+1)*rng()),sourceUrl:ref('special/UniformDiscrete')
  },
  {
    id:'lognormal',name:'Lognormal',alias:'Exponentiated normal distribution',type:'Continuous',color:'#b78352',notation:'LN(μ, σ²)',
    description:'A positive, right-skewed variable whose logarithm follows a normal distribution.',use:'Multiplicative growth and positive quantities that span orders of magnitude. μ and σ describe log(X).',tags:['Positive','Multiplicative'],
    formula:'f(x) = exp(−(ln x − μ)² / (2σ²)) / (xσ√(2π)),  x > 0',params:[param('mu','Mean of log(X)','μ',0,-2,2,.1),param('sigma','Std. dev. of log(X)','σ',.5,.1,2,.1)],
    density:(x,{mu,sigma}) => x<=0?0:Math.exp(-.5*((Math.log(x)-mu)/sigma)**2)/(x*sigma*Math.sqrt(2*Math.PI)),cdf:(x,{mu,sigma}) => x<=0?0:normalCdf((Math.log(x)-mu)/sigma),
    range:({mu,sigma}) => [0,Math.exp(mu+3*sigma)],plotKnots:({mu,sigma})=>Array.from({length:161},(_,i)=>Math.exp(mu+sigma*(-8+11*i/160))),
    stats:({mu,sigma}) => ({Mean:Math.exp(mu+sigma*sigma/2),Variance:Math.expm1(sigma*sigma)*Math.exp(2*mu+sigma*sigma),'Std. deviation':Math.sqrt(Math.expm1(sigma*sigma)*Math.exp(2*mu+sigma*sigma)),Median:Math.exp(mu),Support:'(0, ∞)',Mode:Math.exp(mu-sigma*sigma)}),
    sample:({mu,sigma},rng) => Math.exp(mu+sigma*normal(rng)),sourceUrl:ref('special/LogNormal')
  },
  {
    id:'laplace',name:'Laplace',alias:'Double exponential distribution',type:'Continuous',color:'#9b6f9c',notation:'Laplace(μ, s)',
    description:'A sharp central peak with symmetric exponential tails, heavier than those of a normal distribution.',use:'Model errors with occasional large deviations and study absolute-error loss.',tags:['Symmetric','Sharp peak'],
    formula:'f(x) = exp(−|x − μ| / s) / (2s)',params:[location(),scale()],
    density:(x,{mu,scale}) => Math.exp(-Math.abs(x-mu)/scale)/(2*scale),cdf:(x,{mu,scale}) => x<mu?.5*Math.exp((x-mu)/scale):1-.5*Math.exp(-(x-mu)/scale),range:({mu,scale})=>[mu-7*scale,mu+7*scale],
    stats:({mu,scale})=>({Mean:mu,Variance:2*scale**2,'Std. deviation':Math.SQRT2*scale,Median:mu,Support:'(−∞, ∞)',Skewness:0}),
    sample:({mu,scale},rng)=>{const u=openUniform(rng);return u<.5?mu+scale*Math.log(2*u):mu-scale*Math.log(2*(1-u));},sourceUrl:ref('special/Laplace')
  },
  {
    id:'logistic',name:'Logistic',alias:'Logistic location-scale distribution',type:'Continuous',color:'#7487b8',notation:'Logistic(μ, s)',
    description:'A symmetric bell-shaped density whose cumulative probability follows a sigmoid curve.',use:'Latent error models and growth thresholds; its heavier tails allow more extreme values than a normal distribution.',tags:['Symmetric','Sigmoid CDF'],
    formula:'f(x) = exp(−z) / (s(1 + exp(−z))²),  z = (x − μ)/s',params:[location(),scale()],
    density:(x,{mu,scale})=>{const t=Math.exp(-Math.abs((x-mu)/scale));return t/(scale*(1+t)**2);},cdf:(x,{mu,scale})=>logisticCdf((x-mu)/scale),range:({mu,scale})=>[mu-8*scale,mu+8*scale],
    stats:({mu,scale})=>({Mean:mu,Variance:Math.PI**2*scale**2/3,'Std. deviation':Math.PI*scale/Math.sqrt(3),Median:mu,Support:'(−∞, ∞)',Skewness:0}),
    sample:({mu,scale},rng)=>{const u=openUniform(rng);return mu+scale*(Math.log(u)-Math.log1p(-u));},sourceUrl:ref('special/Logistic')
  },
  {
    id:'cauchy',name:'Cauchy',alias:'Heavy-tailed location-scale distribution',type:'Continuous',color:'#ad796e',notation:'Cauchy(x₀, s)',
    description:'A symmetric distribution with very heavy tails. Its mean and variance do not exist.',use:'Ratios of independent standard normal variables and resonance profiles. Sample averages need not settle toward a population mean.',tags:['Heavy tails','Undefined mean'],
    formula:'f(x) = 1 / (πs(1 + ((x − x₀)/s)²))',params:[param('center','Location','x₀',0,-10,10,.1),scale()],
    density:(x,{center,scale})=>1/(Math.PI*scale*(1+((x-center)/scale)**2)),cdf:(x,{center,scale})=>.5+Math.atan((x-center)/scale)/Math.PI,range:({center,scale})=>[center-12*scale,center+12*scale],
    stats:({center})=>({Mean:'Undefined',Variance:'Undefined','Std. deviation':'Undefined',Median:center,Support:'(−∞, ∞)',Mode:center}),exampleX:({center})=>center,
    sample:({center,scale},rng)=>center+scale*Math.tan(Math.PI*(openUniform(rng)-.5)),sourceUrl:ref('special/Cauchy')
  },
  {
    id:'weibull',name:'Weibull',alias:'Shape-and-scale lifetime distribution',type:'Continuous',color:'#8c9660',notation:'Weibull(k, s)',
    description:'A flexible lifetime model with a shape parameter that changes how failure risk evolves.',use:'Reliability and time-to-failure models. Shape below 1 gives decreasing hazard, shape 1 constant hazard, and shape above 1 increasing hazard.',tags:['Lifetimes','Flexible shape'],
    formula:'f(x) = (k/s)(x/s)ᵏ⁻¹ exp(−(x/s)ᵏ),  x ≥ 0',params:[param('shape','Shape','k',2,.5,5,.1),scale()],
    density:(x,{shape,scale})=>x<0?0:x===0?(shape<1?Infinity:shape===1?1/scale:0):(shape/scale)*(x/scale)**(shape-1)*Math.exp(-((x/scale)**shape)),cdf:(x,{shape,scale})=>x<=0?0:-Math.expm1(-((x/scale)**shape)),range:({shape,scale})=>[shape<1?scale*(-Math.log(.995))**(1/shape):0,scale*(-Math.log(.001))**(1/shape)],
    plotKnots:({shape,scale})=>shape<1?Array.from({length:161},(_,i)=>scale*(-Math.log1p(-(.005+.994*i/160)))**(1/shape)):[],
    stats:({shape,scale})=>{const a=gamma(1+1/shape),v=scale**2*(gamma(1+2/shape)-a*a);return {Mean:scale*a,Variance:v,'Std. deviation':Math.sqrt(v),Median:scale*Math.LN2**(1/shape),Support:'[0, ∞)',Mode:shape>1?scale*((shape-1)/shape)**(1/shape):0};},
    sample:({shape,scale},rng)=>scale*(-Math.log1p(-rng()))**(1/shape),sourceUrl:ref('special/Weibull')
  },
  {
    id:'rayleigh',name:'Rayleigh',alias:'Magnitude of a Gaussian vector',type:'Continuous',color:'#509aac',notation:'Rayleigh(σ)',
    description:'The magnitude of two independent, zero-mean normal components with the same standard deviation.',use:'Model amplitudes and radial errors when two perpendicular components have independent normal noise.',tags:['Magnitudes','Positive'],
    formula:'f(x) = (x/σ²) exp(−x²/(2σ²)),  x ≥ 0',params:[param('sigma','Scale','σ',1,.1,5,.1)],
    density:(x,{sigma})=>x<0?0:x/sigma**2*Math.exp(-x*x/(2*sigma*sigma)),cdf:(x,{sigma})=>x<=0?0:-Math.expm1(-x*x/(2*sigma*sigma)),range:({sigma})=>[0,4*sigma],
    stats:({sigma})=>({Mean:sigma*Math.sqrt(Math.PI/2),Variance:(4-Math.PI)*sigma*sigma/2,'Std. deviation':sigma*Math.sqrt((4-Math.PI)/2),Median:sigma*Math.sqrt(2*Math.LN2),Support:'[0, ∞)',Mode:sigma}),
    sample:({sigma},rng)=>sigma*Math.sqrt(-2*Math.log1p(-rng())),sourceUrl:ref('special/Rayleigh')
  },
  {
    id:'pareto',name:'Pareto',alias:'Type I power-law distribution',type:'Continuous',color:'#bc8666',notation:'Pareto(xₘ, α)',
    description:'A power-law tail above a positive minimum. Smaller shape values make extreme outcomes more likely.',use:'Explore heavy-tailed sizes and wealth models. The mean is infinite for α ≤ 1, and variance is not finite for α ≤ 2.',tags:['Power law','Heavy tails'],
    formula:'f(x) = (α/xₘ)(xₘ/x)ᵅ⁺¹,  x ≥ xₘ',params:[param('minimum','Minimum','xₘ',1,.1,5,.1),param('alpha','Shape','α',5,.5,10,.1)],
    density:(x,{minimum,alpha})=>x<minimum?0:alpha/minimum*(minimum/x)**(alpha+1),cdf:(x,{minimum,alpha})=>x<minimum?0:-Math.expm1(alpha*Math.log(minimum/x)),range:({minimum,alpha})=>[minimum,minimum*100**(1/alpha)],
    plotKnots:({minimum,alpha})=>Array.from({length:161},(_,i)=>minimum*100**(i/(160*alpha))),
    stats:({minimum,alpha})=>({Mean:alpha>1?alpha*minimum/(alpha-1):'∞',Variance:alpha>2?minimum**2*alpha/((alpha-1)**2*(alpha-2)):alpha>1?'∞':'Undefined','Std. deviation':alpha>2?minimum*Math.sqrt(alpha/((alpha-1)**2*(alpha-2))):alpha>1?'∞':'Undefined',Median:minimum*2**(1/alpha),Support:`[${minimum}, ∞)`,Mode:minimum}),exampleX:({minimum,alpha})=>minimum*2**(1/alpha),
    sample:({minimum,alpha},rng)=>minimum/(1-rng())**(1/alpha),sourceUrl:ref('special/Pareto')
  },
  {
    id:'triangular',name:'Triangular',alias:'Minimum, mode, and maximum model',type:'Continuous',color:'#7f94b0',notation:'Tri(a, c, b)',
    description:'A bounded distribution built from a minimum, a most likely value, and a maximum.',use:'Simple estimates when only lower, upper, and most likely values are known. The explorer uses an interior mode (a < c < b).',tags:['Bounded','Three-point estimate'],
    formula:'f(x) = 2(x−a)/((b−a)(c−a)) for a ≤ x ≤ c; 2(b−x)/((b−a)(b−c)) for c < x ≤ b',params:[param('a','Lower bound','a',0,-10,9,.1),param('c','Mode','c',.5,-9.9,9.9,.1),param('b','Upper bound','b',1,-9,10,.1)],constraints:[{left:'a',op:'<',right:'c',message:'Mode must exceed the lower bound.'},{left:'c',op:'<',right:'b',message:'Mode must be below the upper bound.'}],
    density:(x,{a,b,c})=>x<a||x>b?0:x<=c?2*(x-a)/((b-a)*(c-a)):2*(b-x)/((b-a)*(b-c)),cdf:(x,{a,b,c})=>x<=a?0:x>=b?1:x<=c?(x-a)**2/((b-a)*(c-a)):1-(b-x)**2/((b-a)*(b-c)),range:({a,b})=>[a,b],plotKnots:({c})=>[c],
    stats:({a,b,c})=>({Mean:(a+b+c)/3,Variance:((a-b)**2+(a-c)**2+(b-c)**2)/36,'Std. deviation':Math.sqrt(((a-b)**2+(a-c)**2+(b-c)**2)/36),Median:c>=(a+b)/2?a+Math.sqrt((b-a)*(c-a)/2):b-Math.sqrt((b-a)*(b-c)/2),Support:`[${a}, ${b}]`,Mode:c}),
    sample:({a,b,c},rng)=>{const u=rng();return u<(c-a)/(b-a)?a+Math.sqrt(u*(b-a)*(c-a)):b-Math.sqrt((1-u)*(b-a)*(b-c));},sourceUrl:ref('special/Triangle')
  }
];
