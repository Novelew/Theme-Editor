// Convert integer color to RGBA
function intToRGBA(color) {
    const alpha = ((color >> 24) & 0xFF);
    const red = (color >> 16) & 0xFF;
    const green = (color >> 8) & 0xFF;
    const blue = color & 0xFF;
    return { red, green, blue, alpha };
}

// Convert RGBA to hex with alpha
function rgbaToHex({ red, green, blue, alpha }) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(alpha)}${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

// Convert hex to integer color
function hexToInt(hex) {
    hex = hex.replace('#', '');
    const alpha = parseInt(hex.substring(0, 2), 16);
    const red = parseInt(hex.substring(2, 4), 16);
    const green = parseInt(hex.substring(4, 6), 16);
    const blue = parseInt(hex.substring(6, 8), 16);
    return (alpha << 24) | (red << 16) | (green << 8) | blue;
}

// Create color editor element
function createColorEditor(name, colorValue) {
    const rgba = intToRGBA(colorValue);
    const hex = rgbToHex(rgba.red, rgba.green, rgba.blue, rgba.alpha);

    const div = document.createElement('div');
    div.className = 'color-item';
    
    const preview = document.createElement('div');
    preview.className = 'color-preview';
    preview.style.backgroundColor = `rgba(${rgba.red}, ${rgba.green}, ${rgba.blue}, ${rgba.alpha / 255})`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'color-name';
    nameSpan.textContent = name;
    
    const input = document.createElement('input');
    input.className = 'color-input';
    input.value = hex;
    
    // Add event listener for input changes
    input.addEventListener('input', () => {
        const rgb = hexToRgb(input.value);
        if (rgb) {
            preview.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a / 255})`;
        }
    });
    
    div.appendChild(preview);
    div.appendChild(nameSpan);
    div.appendChild(input);
    
    initializeColorPicker(div);
    
    return div;
}

// Default theme
const defaultTheme = {
    "name": "",
    "author": "",
    "default": false,
    "values": [
        { "Основной": -1258093820 },
        { "Визуальные модули": -10522177 },
        { "Текст": -3089680 },
        { "Неактивный текст": -1465603157 },
        { "Текст заголовков": -824974081 },
        { "Премиум текст": -1965562625 },
        { "Слайдер": 998015999 },
        { "Круг слайдера": -11381603 },
        { "Окно слайдера": 475157661 },
        { "Переключатель": -9078825 },
        { "Неактивный переключатель": -11381603 },
        { "Кнопка": -1873652579 },
        { "Неактивная кнопка": 1126574924 },
        { "Обводка": 1280464029 },
        { "Разделитель": 1414681757 },
        { "Скролл бар": -1504553827 },
        { "Поле": 844256413 },
        { "Неактивное поле": 223499421 },
        { "Лого": -8024833 },
        { "Текст в лого": -2628353 },
        { "Фон в подсказках": -1358888174 },
        { "Текст в подсказках": -2628353 },
        { "Фон окон": 1610810116 },
        { "Текст окон": -1 }
    ]
};

// Function to load theme data
function loadThemeData(theme) {
    document.getElementById('themeName').value = theme.name || '';
    document.getElementById('themeAuthor').value = theme.author || '';

    const themeColors = document.getElementById('themeColors');
    themeColors.innerHTML = '';

    theme.values.forEach(value => {
        const [name, color] = Object.entries(value)[0];
        const colorEditor = createColorEditor(name, color);
        themeColors.appendChild(colorEditor);
    });
}

// Load default theme on page load
window.addEventListener('load', () => {
    initColorWheel();
    loadThemeData(defaultTheme);
});

// Load theme file
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            // Decompress data using pako (zlib implementation in JS)
            const compressed = new Uint8Array(event.target.result);
            const decompressed = pako.inflate(compressed, { to: 'string' });
            const theme = JSON.parse(decompressed);
            loadThemeData(theme);
        } catch (error) {
            alert('Error loading theme file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// Save theme file
function saveTheme() {
    const themeColors = document.getElementById('themeColors');
    const colorItems = themeColors.getElementsByClassName('color-item');
    
    const theme = {
        name: document.getElementById('themeName').value || "theme",
        author: document.getElementById('themeAuthor').value || "Unknown",
        default: false,
        values: []
    };

    Array.from(colorItems).forEach(item => {
        const name = item.querySelector('.color-name').textContent;
        const hex = item.querySelector('.color-input').value;
        const colorValue = hexToInt(hex);
        theme.values.push({ [name]: colorValue });
    });

    // Compress the JSON
    const jsonString = JSON.stringify(theme);
    const compressed = pako.deflate(jsonString);
    
    // Create and download file
    const blob = new Blob([compressed], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (theme.name || 'theme') + '.file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add pako library for zlib compression/decompression
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js';
document.head.appendChild(script);

// Color Picker Implementation
let currentColorItem = null;
const modal = document.getElementById('colorPickerModal');
const colorWheel = document.getElementById('colorWheel');
const colorPreview = document.getElementById('colorPreview');
const hexInput = document.getElementById('hexInput');
const redInput = document.getElementById('redInput');
const greenInput = document.getElementById('greenInput');
const blueInput = document.getElementById('blueInput');
const alphaSlider = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const formatBtns = document.querySelectorAll('.format-btn');

let currentColor = { r: 255, g: 0, b: 0, a: 255 };

// Initialize color wheel
function initColorWheel() {
    const ctx = colorWheel.getContext('2d');
    const width = colorWheel.width;
    const height = colorWheel.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2;

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 2) * Math.PI / 180;
        const endAngle = (angle + 2) * Math.PI / 180;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        const hue = angle;
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// Convert RGB to HEX
function rgbToHex(r, g, b, a) {
    return '#' + [a, r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Convert HEX to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        a: parseInt(result[1], 16),
        r: parseInt(result[2], 16),
        g: parseInt(result[3], 16),
        b: parseInt(result[4], 16)
    } : null;
}

// Update color preview and inputs
function updateColorDisplay() {
    const hex = rgbToHex(currentColor.r, currentColor.g, currentColor.b, currentColor.a);
    colorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
    hexInput.value = hex;
    redInput.value = currentColor.r;
    greenInput.value = currentColor.g;
    blueInput.value = currentColor.b;
    alphaSlider.value = currentColor.a;
    alphaValue.textContent = currentColor.a;

    // Update the color preview of the currently edited color item
    if (currentColorItem) {
        const preview = currentColorItem.querySelector('.color-preview');
        const input = currentColorItem.querySelector('.color-input');
        preview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
        input.value = hex;
    }
}

// Event Listeners for color wheel
colorWheel.addEventListener('mousedown', startColorSelection);
colorWheel.addEventListener('mousemove', handleColorSelection);
document.addEventListener('mouseup', stopColorSelection);

let isSelecting = false;

function startColorSelection(e) {
    isSelecting = true;
    handleColorSelection(e);
}

function stopColorSelection() {
    isSelecting = false;
}

function handleColorSelection(e) {
    if (!isSelecting && e.type === 'mousemove') return;
    
    const rect = colorWheel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = colorWheel.width / 2;
    const centerY = colorWheel.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    
    // Calculate angle and distance from center
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), centerX);
    
    // Convert angle to hue (0-360)
    let hue = (angle * 180 / Math.PI + 360) % 360;
    
    // Convert distance to saturation (0-100)
    const saturation = (distance / centerX) * 100;
    
    // Convert HSV to RGB
    const hsv = { h: hue, s: saturation, v: 100 };
    const rgb = hsvToRgb(hsv);
    
    currentColor.r = rgb.r;
    currentColor.g = rgb.g;
    currentColor.b = rgb.b;
    
    updateColorDisplay();
}

// Convert HSV to RGB
function hsvToRgb(hsv) {
    const h = hsv.h;
    const s = hsv.s / 100;
    const v = hsv.v / 100;
    
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Event listeners for inputs
hexInput.addEventListener('input', function() {
    const rgb = hexToRgb(this.value);
    if (rgb) {
        currentColor = rgb;
        updateColorDisplay();
    }
});

redInput.addEventListener('input', function() {
    currentColor.r = clamp(parseInt(this.value) || 0, 0, 255);
    updateColorDisplay();
});

greenInput.addEventListener('input', function() {
    currentColor.g = clamp(parseInt(this.value) || 0, 0, 255);
    updateColorDisplay();
});

blueInput.addEventListener('input', function() {
    currentColor.b = clamp(parseInt(this.value) || 0, 0, 255);
    updateColorDisplay();
});

alphaSlider.addEventListener('input', function() {
    currentColor.a = parseInt(this.value);
    updateColorDisplay();
});

// Helper function to clamp values
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Format toggle buttons
formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const hexInputs = document.querySelector('.hex-inputs');
        const argbInputs = document.querySelector('.argb-inputs');
        
        if (format === 'hex') {
            hexInputs.style.display = 'block';
            argbInputs.style.display = 'none';
        } else {
            hexInputs.style.display = 'none';
            argbInputs.style.display = 'block';
        }
    });
});

// Apply and cancel buttons
document.getElementById('applyColor').addEventListener('click', () => {
    if (currentColorItem) {
        const preview = currentColorItem.querySelector('.color-preview');
        const input = currentColorItem.querySelector('.color-input');
        const hex = rgbToHex(currentColor.r, currentColor.g, currentColor.b, currentColor.a);
        
        preview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
        input.value = hex;
    }
    modal.classList.remove('show');
});

document.getElementById('cancelColor').addEventListener('click', () => {
    modal.classList.remove('show');
});

// Initialize color picker when clicking on a color preview
function initializeColorPicker(colorItem) {
    const preview = colorItem.querySelector('.color-preview');
    const input = colorItem.querySelector('.color-input');
    
    preview.addEventListener('click', () => {
        currentColorItem = colorItem;
        const rgb = hexToRgb(input.value);
        if (rgb) {
            currentColor = rgb;
            updateColorDisplay();
        }
        modal.classList.add('show');
    });
}
