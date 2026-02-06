import React from "react";
import Orads2Image from "../../assets/Orads2.jpg";
import Orads2Image2 from "../../assets/orads2-2.jpg";
import Orads3Image from "../../assets/orads3.jpg";
import Orads4Image from "../../assets/orads4.jpg";
import Orads5Image from "../../assets/orads5.jpg";
import OvaryVascImage from "../../assets/ovaryvasc.jpg";

const Orads: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">Классификация O-RADS (УЗИ)</h3>

    <div className="mb-6">
      <p className="text-sm text-slate-600">
        O-RADS (Ovarian-Adnexal Reporting and Data System) — система интерпретации и
        протоколирования ультразвуковых исследований образований яичников, которая связывает
        находки с оценкой риска злокачественности и помогает в выборе тактики.
      </p>
    </div>

<div className="mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Описание</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Риск злокачественности</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 border-b">O-RADS 0</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Неполная оценка</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">O-RADS 1</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Физиологические изменения</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">O-RADS 2</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Однозначно доброкачественное образование</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">&lt; 1%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-yellow-600 border-b">O-RADS 3</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Низкий риск</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">1–&lt;10%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-600 border-b">O-RADS 4</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Промежуточный риск</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">10–&lt;50%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-red-600">O-RADS 5</td>
              <td className="px-4 py-3 text-sm text-slate-600">Высокий риск</td>
              <td className="px-4 py-3 text-sm text-slate-600">&gt; 50%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="mb-6">
      <h4 className="text-md font-medium text-slate-600 mb-3">Категории O-RADS</h4>

      <div className="space-y-4 text-sm text-slate-600">
        <div>
          <p className="font-medium text-slate-700">O-RADS 0, неполная оценка.</p>
          <p>
            Невозможность провести ультразвуковую оценку внутренних женских половых органов
            из-за соматического состояния пациентки, из-за технических факторов, таких как газ
            в кишечнике, большой размер образования, расположение придатков или невозможность
            провести трансвагинальное исследование.
          </p>
          <p className="mt-2">
            Рекомендуемая схема маршрутизации в рамках системы муниципального здравоохранения:
            по решению гинеколога может быть проведено повторное УЗИ или выполнено альтернативное
            исследование.
          </p>
        </div>

        <div>
          <p className="font-medium text-slate-700">O-RADS 1, нормальный неизмененный яичник (рис. 3).</p>
          <p>
            Физиологическая категория, имеет отношение только к пациенткам в период до наступления
            постменопаузы, включает фолликул в виде простой кисты ≤ 3 см и желтое тело ≤ 3 см.
            Во избежание неправильного понимания пациентами рекомендуется в заключении УЗИ
            описывать изменения данной категории как фолликул и желтое тело, а не как киста.
          </p>
        </div>

        <div>
          <p>
            <span className="font-medium text-slate-700">O-RADS 2</span>, почти наверняка доброкачественный процесс
            (&lt;1% риск злокачественного новообразования) включает в себя следующие виды выявленных изменений (рис. 4,5):
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>простые кисты &gt; 3 см, но &lt; 10 см у женщин в период до наступления постменопаузы и &lt; 10 см у женщин в постменопаузе;</li>
            <li>однокамерные кисты без солидного компонента с ровными стенками &lt;10 см;</li>
            <li>типичные геморрагические кисты &lt; 10 см;</li>
            <li>типичные зрелые тератомы (дермоидные кисты) &lt; 10 см;</li>
            <li>типичные эндометриоидные кисты &lt; 10 см;</li>
            <li>простые параовариальные кисты, перитонеальные кисты, типичный гидросальпинкс любого размерами;</li>
          </ul>
          <img
            src={Orads2Image}
            alt="O-RADS 2: примеры доброкачественных образований"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
          <img
            src={Orads2Image2}
            alt="O-RADS 2: дополнительные примеры"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>

        <div>
          <p>
            <span className="font-medium text-slate-700">O-RADS 3</span> - патологические образования с низким риском
            малигнизации (риск злокачественного новообразования от 1% до &lt;10%), включает следующие образования (рис. 6):
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>однокамерные кисты без солидного компонента с ровным внутренним контуром стенки, размером ≥10 см;</li>
            <li>типичные геморрагические кисты размером ≥ 10 см;</li>
            <li>типичные зрелые тератомы (дермоидные кисты) размером ≥ 10 см;</li>
            <li>типичные эндометриоидные кисты размером ≥ 10 см;</li>
            <li>однокамерные кисты с неровным внутренним контуром стенки, любого размерами;</li>
            <li>многокамерные кисты без солидного компонента с ровным внутренним контуром, размером &lt; 10 см, васкуляризация 1-3 балла;</li>
            <li>солидное образование с ровным внешним контуром, любого размерами, васкуляризация 1 балл.</li>
          </ul>
          <img
            src={Orads3Image}
            alt="O-RADS 3: примеры образований"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>

        <div>
          <p>
            <span className="font-medium text-slate-700">O-RADS 4</span> - патологические образования с промежуточным риском
            малигнизации (риск злокачественного новообразования от 10% до &lt;50%) (рис. 7):
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>многокамерная киста без солидного компонента с ровным внутренним контуром стенки, размером ≥ 10 см, васкуляризация 1-3 балла,</li>
            <li>многокамерная киста без солидного компонента с ровным внутренним контуром стенки, любого размера, васкуляризация 4 балла;</li>
            <li>многокамерная киста без солидного компонента с неровным внутренним контуром стенки и/или с неровными перегородками, любого размерами, любой степени васкуляризации;</li>
            <li>однокамерные кисты с солидным компонентом без папиллярных разрастаний, любого размера, любой васкуляризации;</li>
            <li>однокамерная киста с 1-3 папиллярными разрастанием, любого размера, любой степени васкуляризации.</li>
            <li>многокамерная киста с солидным компонентом, любого размерами, васкуляризация 1-2 балла;</li>
            <li>солидное образование с ровным внешним контурами, любого размера, васкуляризация 2-3 балла.</li>
          </ul>
          <img
            src={Orads4Image}
            alt="O-RADS 4: примеры образований"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>

        <div>
          <p>
            <span className="font-medium text-slate-700">O-RADS 5</span> - патологические образования c высоким риском
            малигнизации (50–100% риск злокачественного новообразования):
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>однокамерная киста с 4 и более папиллярными разрастаниями, любого размерами, любой степени васкуляризации;</li>
            <li>многокамерная киста с солидным компонентом, любого размерами, васкуляризация 3-4 балла;</li>
            <li>солидное образование с ровным внешним контуром, любого размера васкуляризация 4 балла;</li>
            <li>солидное образование с неровным внешним контуром, любого размера, любой степени васкуляризации;</li>
            <li>утолщение брюшины и/или перитонеальные солидные разрастания без или с асцитом.</li>
          </ul>
          <img
            src={Orads5Image}
            alt="O-RADS 5: примеры образований"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>

        <div>
          <p className="font-medium text-slate-700">Васкуляризация</p>
          <p>
            Цветовая допплеровская оценка образований по данным группы IOTA информативна как дополнительный критерий при
            оценке вероятности злокачественности выявленного образования.
          </p>
          <p>
            • Циркулярный кровоток (в стенке образования). Кровоток ограничен стенкой образования и занимает большую часть
            (более половины) окружности стенки. Такой тип васкуляризации еще называется «цветовое кольцо», он характерен для
            желтого тела, не является патологическим.
          </p>
          <p>
            • Внутренний кровоток: васкуляризация определяется внутри солидного образования, солидного компонента или в
            перегородке.
          </p>
          <p>
            • Интенсивность васкуляризации в баллах от 1 до 4: это общая оценка васкуляризации всего образования, включая
            и кровоток в стенке и внутренний кровоток:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Васкуляризация не определяется (1 балл);</li>
            <li>Минимальная (скудная) васкуляризация (2 балла);</li>
            <li>Умеренная васкуляризация (3 балла);</li>
            <li>Выраженная (интенсивная) васкуляризация (4 балла). Интенсивность васкуляризации оценивается субъективно без использования спектральной допплерографии.</li>
          </ul>
          <img
            src={OvaryVascImage}
            alt="O-RADS: степени васкуляризации (1–4 балла)"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>
      </div>
    </div>

    


  </div>
);

export default Orads;
