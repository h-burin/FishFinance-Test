// กำหนดตัวแปรเพื่ออ้างอิงถึงองค์ประกอบ HTML
const amountInput = document.getElementById("amount-input"); // ช่องกรอกจำนวนเงิน
const errorMessage = document.getElementById("error-message"); // ช่องแสดงข้อความแสดงข้อผิดพลาด
const submitBtn = document.getElementById("submit-btn"); // ปุ่มส่งข้อมูล
const tableBody = document.getElementById("table-body"); // ช่องสำหรับแสดงตารางข้อมูล
const totalFishCostElement = document.getElementById("total-fish-cost"); // ช่องแสดงยอดรวมราคาปลา
const totalDiscountElement = document.getElementById("total-discount"); // ช่องแสดงยอดรวมส่วนลด
const finalTotalElement = document.getElementById("final-total"); // ช่องแสดงยอดรวมสุดท้าย
const remainingAmountElement = document.getElementById("remaining-amount"); // ช่องแสดงจำนวนเงินที่เหลือ

// สร้างอาร์เรย์สำหรับชื่อเดือนในภาษาไทย
const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

// ฟังก์ชันสำหรับฟอร์แมตวันที่เป็นรูปแบบ "วัน เดือน ปี"
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate(); // ดึงวัน
  const month = months[date.getMonth()]; // ดึงชื่อเดือน
  const year = date.getFullYear(); // ดึงปี
  return `${day} ${month} ${year}`; // คืนค่าในรูปแบบที่ต้องการ
}

// ฟังก์ชันตรวจสอบความถูกต้องของจำนวนเงิน
function validateAmount(value) {
  if (isNaN(value) || value <= 0) {
    errorMessage.textContent = "กรุณากรอกจำนวนเงินที่มากกว่า 0"; // แสดงข้อความข้อผิดพลาด
    return false; // คืนค่า false ถ้าค่าที่กรอกไม่ถูกต้อง
  }
  if (value > 1000) {
    errorMessage.textContent = "กรุณากรอกตัวเลขไม่เกิน 1000"; // แสดงข้อความข้อผิดพลาด
    amountInput.value = 1000; // ตั้งค่าให้เป็น 1000 ถ้ากรอกมากกว่า
    return false; // คืนค่า false
  }
  errorMessage.textContent = ""; // ล้างข้อความข้อผิดพลาด
  return true; // คืนค่า true ถ้าค่าถูกต้อง
}

// ฟังก์ชันดึงข้อมูลจาก API
async function fetchData() {
  try {
    const response = await fetch(
      "https://sopon007.github.io/sample.github.io/test.json"
    );
    if (!response.ok) throw new Error("Network response was not ok"); // ตรวจสอบการตอบสนองจากเซิร์ฟเวอร์
    const data = await response.json(); // แปลงข้อมูลเป็น JSON
    return data.sort((a, b) => b.detail.price - a.detail.price); // เรียงข้อมูลตามราคา
  } catch (error) {
    console.error("Error fetching data:", error); // แสดงข้อผิดพลาดในคอนโซล
    errorMessage.textContent = "ไม่สามารถดึงข้อมูลได้"; // แสดงข้อความข้อผิดพลาด
    return []; // คืนค่าอาร์เรย์ว่าง
  }
}

// ฟังก์ชันสำหรับแสดงข้อมูลในตาราง
function displayDataInTable(result) {
  tableBody.innerHTML = ""; // ล้างเนื้อหาก่อน
  result.forEach((item, index) => {
    const row = document.createElement("tr"); // สร้างแถวใหม่
    row.innerHTML = `<th scope="row">${index + 1}</th>
      <td>${item.name}</td>
      <td>${item.quantity} ตัว</td>
      <td>เป็นจำนวนเงิน ${item.totalPrice + item.discount} บาท</td>
      <td>ส่วนลด ${item.discount} บาท</td>
      <td>หมดอายุ ${formatDate(item.expired)}</td>`;
    tableBody.appendChild(row); // เพิ่มแถวเข้าไปในตาราง
  });
}

// ฟังก์ชันคำนวณยอดรวม
function calculateTotals(amount, fishData) {
  let remainingAmount = amount; // จำนวนเงินที่เหลือ
  let totalFishCost = 0; // ยอดรวมราคาปลาทั้งหมด
  let totalDiscount = 0; // ยอดรวมส่วนลด
  let result = []; // อาร์เรย์สำหรับเก็บผลลัพธ์

  // วนลูปผ่านข้อมูลปลาที่มี
  fishData.forEach((fish) => {
    const price = fish.detail.price; // ราคาแต่ละตัว
    const availableQuantity = fish.detail.quantity; // จำนวนที่มี
    let discount = 0; // ตัวแปรสำหรับเก็บส่วนลด

    // ตรวจสอบว่ามีเงินพอซื้อและปลามีจำนวนมากกว่า 0
    if (remainingAmount >= price && availableQuantity > 0) {
      const maxAffordableQuantity = Math.floor(remainingAmount / price); // จำนวนที่ซื้อได้สูงสุด
      const quantityToBuy = Math.min(maxAffordableQuantity, availableQuantity); // จำนวนที่จะซื้อ

      // ตรวจสอบว่าปลานั้นมีรหัส "001" และให้ส่วนลด
      if (fish.code === "001") {
        const discountQuantity = Math.floor(quantityToBuy / 2); // คำนวณจำนวนที่ได้ส่วนลด
        discount = discountQuantity * 20; // คำนวณจำนวนเงินที่ได้ส่วนลด
        totalDiscount += discount; // รวมส่วนลด
      }

      const totalPrice = quantityToBuy * price - discount; // คำนวณราคาสุทธิ
      totalFishCost += totalPrice; // รวมราคาปลาทั้งหมด
      remainingAmount -= totalPrice; // ลดจำนวนเงินที่เหลือ

      // เก็บข้อมูลผลลัพธ์สำหรับการแสดงในตาราง
      result.push({
        name: fish.name,
        quantity: quantityToBuy,
        totalPrice: totalPrice,
        discount: discount,
        expired: fish.detail.expired,
      });
    }
  });

  // คืนค่าผลลัพธ์ที่ต้องการ
  return { totalFishCost, totalDiscount, remainingAmount, result };
}

// เพิ่ม Event Listener สำหรับการตรวจสอบจำนวนเงินเมื่อกรอกข้อมูล
amountInput.addEventListener("input", () => {
  validateAmount(parseInt(amountInput.value, 10)); // ตรวจสอบความถูกต้องของจำนวนเงิน
});

// เพิ่ม Event Listener สำหรับการคลิกปุ่มส่ง
submitBtn.addEventListener("click", async () => {
  const amount = parseInt(amountInput.value, 10); // แปลงค่าที่กรอกเป็นตัวเลข
  if (!validateAmount(amount)) return; // ตรวจสอบความถูกต้อง

  const fishData = await fetchData(); // ดึงข้อมูลปลาจาก API
  const { totalFishCost, totalDiscount, remainingAmount, result } =
    calculateTotals(amount, fishData); // คำนวณยอดรวมและส่วนลด

  displayDataInTable(result); // แสดงผลลัพธ์ในตาราง
  totalFishCostElement.querySelector(".amount").textContent =
    totalFishCost + totalDiscount; // แสดงยอดรวมราคาปลาพร้อมส่วนลด
  totalDiscountElement.querySelector(".amount").textContent = totalDiscount; // แสดงยอดรวมส่วนลด
  finalTotalElement.querySelector(".amount").textContent = totalFishCost; // แสดงยอดรวมสุดท้าย
  remainingAmountElement.querySelector(".amount").textContent = remainingAmount; // แสดงจำนวนเงินที่เหลือ
});
