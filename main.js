const arr_bars = [];


// 在全局范围内定义一个对象，用于跟踪每个不同 Data1 值的颜色类
const colorClasses = {};

// 映射关系
const noteMappings = {
  60: 'C',
  61: 'Db(C#)',
  62: 'D',
  63: 'Eb(D#)',
  64: 'E',
  65: 'F',
  66: 'Gb(F#)',
  67: 'G',
  68: 'Ab(G#)',
  69: 'A',
  70: 'Bb(A#)',
  71: 'B',

  1: 'C#(Db)',
  2: 'D',
  3: 'Eb(D#)',
  4: 'E',
  5: 'F',
  6: 'F#(Gb)',
  7: 'G',
  8: 'G#(Ab)',
  9: 'A',
  10: 'Bb(A#)',
  11: 'B',
};


function handleFile() {
  const fileInput = document.getElementById('xmlFileInput');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const xmlContent = e.target.result;
      displayTracklist(xmlContent);
    };
    reader.onerror = (error) => {
      console.error('Error reading the file:', error);
    };
    reader.readAsText(file);
  }
}

function displayTracklist(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const tracklist = xmlDoc.getElementsByTagName('tracklist2')[0];
  const bpm = extractBPM(tracklist);
  const timeSignature = extractTimeSignature(tracklist);

  let table = "<tr><th>BARS</th><th>MARKERS</th><th>CHORDS</th><th>Details</th><th>TYPE</th></tr>";

  const eventsByPosBar = {};

  function parseElementToTable(element) {
    const elementClass = element.getAttribute('class');

    if (elementClass === 'MRangeMarkerEvent' || elementClass === 'MChordEvent') {
      const posBar = getPosBar(element);
      const stringName = getStringName(element);
      const detailsHTML = getDetails(element);
      const attributesHTML = getAttributes(element);

      if (!eventsByPosBar[posBar]) {
        eventsByPosBar[posBar] = [];
      }

      eventsByPosBar[posBar].push({
        stringName,
        details: detailsHTML,
        attributes: attributesHTML
      });
    } else {
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (child.nodeType == 1 || (child.nodeType == 3 && child.nodeValue.trim() !== '')) {
          parseElementToTable(child);
        }
      }
    }
  }

  function getPosBar(element) {
    const floatNodes = element.querySelectorAll('float[name="Start"]');
    if (floatNodes.length > 0) {
      return floatNodes[0].getAttribute('value') / (480 * 4);
    }
    return '';
  }

  function getStringName(element) {
    const stringNodes = element.querySelectorAll('string[name="Name"]');
    return stringNodes.length > 0 ? stringNodes[0].getAttribute('value') : '';
  }

  function getAttributes(element) {
    let attributesHTML = '';
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        attributesHTML += `${attribute.nodeName}: ${attribute.nodeValue}, `;
      }
      attributesHTML = attributesHTML.slice(0, -2);
    }
    return attributesHTML;
  }

  function getDetails(element) {
    let detailsHTML = '<ul>';
    const floatNodes = element.querySelectorAll('float');
    const stringNodes = element.querySelectorAll('string');
    const intNodes = element.querySelectorAll('int');

    floatNodes.forEach((floatNode) => {
      const n = floatNode.getAttribute('name');
      const n_v = floatNode.getAttribute('value');
      if (n === 'Start') {
        const pos_bar = n_v / (480 * 4);
        detailsHTML += `<li>float ${n}: Startr at the ${pos_bar}bar</li>`;
        arr_bars.push(pos_bar);
      }
      detailsHTML += `<li>float ${n}: ${n_v}</li>`;
    });

    intNodes.forEach((intNode) => {
      const n = intNode.getAttribute('name');
      const n_v = intNode.getAttribute('value');

      if (n === 'Data1') {
        // 检查是否已经有相应的颜色类，如果没有，生成一个新的颜色类
        const colorClass = getColorClass(n_v);
        detailsHTML += `<li class="${colorClass}">int ${n}: ${n_v}</li>`;
      }

      if (['Data1', 'Mask', 'Bass'].includes(n)) {
        detailsHTML += `<li>int ${n}: ${n_v}</li>`;
      }

      if (n === 'chordType') {
        var chordTypeRal = n_v === '6' ? 'maj7' :
          n_v === '7' ? 'dom7' :
          n_v === '8' ? 'min7' :
          n_v === '1' ? 'min' :
          n_v === '0' ? 'maj' :
          n_v === '2' ? 'sus4' :
          n_v === '3' ? 'sus2' :
          n_v === '4' ? 'dim' :
          n_v === '5' ? 'aug' :
          n_v === '11' ? 'minj7' :
          n_v;
        detailsHTML += `<li>int ${n}: ${chordTypeRal}</li>`;
      }
    });

    stringNodes.forEach((stringNode) => {
      const n = stringNode.getAttribute('name');
      detailsHTML += `<li>string ${n}: ${stringNode.getAttribute('value')}</li>`;
    });

    detailsHTML += '</ul>';
    return detailsHTML;
  }

  // 新的函数，用于获取颜色类
  function getColorClass(data1Value) {
    if (!colorClasses[data1Value]) {
      colorClasses[data1Value] = `color-${Object.keys(colorClasses).length + 1}`;
    }
    return colorClasses[data1Value];
  }

  parseElementToTable(tracklist);

  // Sort eventsByPosBar based on posBar
  const sortedPosBars = Object.keys(eventsByPosBar).sort((a, b) => parseFloat(a) - parseFloat(b));

  // Create rows in the table based on sorted eventsByPosBar
  for (const posBar of sortedPosBars) {
    const events = eventsByPosBar[posBar];
    let addedC = false;

    const chordsHTML = events.map(event => {
      if (event.details.includes('int Data1')) {
        const data1Value = event.details.match(/int Data1: (\d+)/);
        console.log("和弦类型" + data1Value);

        const mappedNote = data1Value ? noteMappings[data1Value[1]] : '';

        const chordTypeRalMatch = event.details.match(/int chordType:\s*([^<>\n\s]+)/);
        const chordTypeRal = chordTypeRalMatch ? chordTypeRalMatch[1] : '';

        addedC = false; // Reset the flag since a new chord is encountered
        return `${mappedNote}${chordTypeRal ? ' ' + chordTypeRal : ''}`;
      } else {
        // 如果不存在 int Data1，只在第一次添加 "C" + chordTypeRal，之后仍然处理并显示 chordType
        if (!addedC) {
          addedC = true;
          const chordTypeRalMatch = event.details.match(/int chordType:\s*([^<>\n\s]+)/);
          const chordTypeRal = chordTypeRalMatch ? chordTypeRalMatch[1] : '';
          return `C${chordTypeRal ? ' ' + chordTypeRal : ''}`;
        } else {
          const chordTypeRalMatch = event.details.match(/int chordType:\s*([^<>\n\s]+)/);
          const chordTypeRal = chordTypeRalMatch ? chordTypeRalMatch[1] : '';
          return `${chordTypeRal ? ' ' + chordTypeRal : ''}`;
        }
      }
    }).join('<br>');


    const rowHTML = `<tr><td>${posBar}</td><td>${events.map(event => event.stringName).join('<br>')}</td><td>${chordsHTML}</td><td>${events.map(event => event.details).join('<br>')}</td><td>${events.map(event => event.attributes).join('<br>')}</td></tr>`;
    table += rowHTML;
  }

  document.getElementById('tracklist-table').innerHTML = table;
  document.getElementById('bpm-container').innerText = `BPM: ${bpm}`;
  document.getElementById('time-signature-container').innerText = `Time Signature: ${timeSignature}`;
}

function extractBPM(tracklist) {
  const tempoEvent = tracklist.querySelector('obj[class="MTempoEvent"]');
  if (tempoEvent) {
    const bpm = tempoEvent.querySelector('float[name="BPM"]');
    return bpm ? bpm.getAttribute('value') : 'N/A';
  }
  return 'N/A';
}

function extractTimeSignature(tracklist) {
  const timeSignatureEvent = tracklist.querySelector('obj[class="MTimeSignatureEvent"]');
  if (timeSignatureEvent) {
    const numerator = timeSignatureEvent.querySelector('int[name="Numerator"]');
    const denominator = timeSignatureEvent.querySelector('int[name="Denominator"]');
    return numerator && denominator ? `${numerator.getAttribute('value')}/${denominator.getAttribute('value')}` : 'N/A';
  }
  return 'N/A';
}