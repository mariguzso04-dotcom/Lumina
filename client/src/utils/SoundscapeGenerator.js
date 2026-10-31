// Generador Acústico de Paisajes Sonoros Procedurales mediante Web Audio API
// Diseñado para funcionar 100% offline, con licencias libres y sin depender de servidores de audio externos.

class SoundscapeGenerator {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.currentPreset = null;
    this.isPlaying = false;
    this.volume = 0.7;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }
    this.isPlaying = false;
    this.currentPreset = null;
  }

  // Generador de ruido rosa / marrón para lluvia y naturaleza
  createNoiseBuffer(type = 'pink') {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        data[i] = white * 0.2;
      }
    }
    return buffer;
  }

  playPreset(preset) {
    this.init();
    this.stop();
    this.currentPreset = preset;
    this.isPlaying = true;

    switch (preset) {
      case 'rain':
        this.playRain();
        break;
      case 'forest':
        this.playForest();
        break;
      case 'river':
        this.playRiver();
        break;
      case 'ocean':
        this.playOcean();
        break;
      case 'drone':
        this.playDrone();
        break;
      case 'night':
        this.playNight();
        break;
      case 'piano_ambience':
      case 'instrumental_calm':
        this.playCalmChords();
        break;
      default:
        this.playRain();
    }
  }

  // 1. Lluvia suave
  playRain() {
    const buffer = this.createNoiseBuffer('pink');
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  // 2. Viento y hojas del bosque
  playForest() {
    const buffer = this.createNoiseBuffer('pink');
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO para modular la brisa suavemente
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }

  // 3. Corriente de río mansa
  playRiver() {
    const buffer = this.createNoiseBuffer('brown');
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  // 4. Olas del océano nocturno
  playOcean() {
    const buffer = this.createNoiseBuffer('pink');
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    // LFO lento para subida y bajada de la marea
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ciclo de ~12s

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain, gain);
  }

  // 5. Armónicos celestiales / Drone meditativo (C3 - G3 - D4)
  playDrone() {
    const freqs = [130.81, 196.00, 293.66, 392.00]; // Do3, Sol3, Re4, Sol4
    const gains = [0.15, 0.12, 0.08, 0.05];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gains[idx] * 0.8, this.ctx.currentTime);

      // Micro modulación para calidez acústica
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();
      this.activeNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  // 6. Noche estrellada y grillos
  playNight() {
    // Ruido de fondo muy bajo
    const buffer = this.createNoiseBuffer('pink');
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();

    // Oscilador de alta frecuencia pulsante para grillos
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4600, this.ctx.currentTime);

    const mod = this.ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(8, this.ctx.currentTime);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    const cricketGain = this.ctx.createGain();
    cricketGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

    mod.connect(modGain);
    modGain.connect(cricketGain.gain);

    osc.connect(cricketGain);
    cricketGain.connect(this.masterGain);

    osc.start();
    mod.start();
    this.activeNodes.push(noise, noiseFilter, noiseGain, osc, mod, modGain, cricketGain);
  }

  // 7. Acordes calmantes suaves
  playCalmChords() {
    const freqs = [174.61, 220.00, 261.63, 329.63]; // Fa3, La3, Do4, Mi4 (Fa Maj7 suave)
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }
}

export const soundscapeGenerator = new SoundscapeGenerator();
export default SoundscapeGenerator;
