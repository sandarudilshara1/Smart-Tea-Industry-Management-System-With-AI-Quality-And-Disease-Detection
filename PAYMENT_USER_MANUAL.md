# 📖 Tea Factory Payment System - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Initial Setup](#initial-setup)
3. [Daily Operations](#daily-operations)
4. [Monthly Payment Process](#monthly-payment-process)
5. [Advance Management](#advance-management)
6. [Reports and History](#reports-and-history)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Who Should Use This Manual?

- **Payment Manager**: Process and approve payments
- **Factory Manager**: Configure rates and view reports
- **Data Entry Staff**: Record daily tea leaf collections

### Accessing the System

1. **Login**: Visit http://localhost:5175
2. **Username**: Your email address
3. **Password**: Provided by your administrator
4. **Dashboard**: After login, click "Payment Manager" from the menu

---

## ⚙️ Initial Setup

### Step 1: Configure Tea Rates

**What is this?** Set the prices you pay suppliers for different tea qualities.

**How to do it:**

1. Go to **Payment Manager** → **Tea Rate Management**
2. Click **"Add New Rate"** button
3. Fill in the form:
   - **Effective Date**: When this rate starts (e.g., 2025-06-01)
   - **Default Rate**: Base price per kg (e.g., Rs. 85.00)
   - **Quality Rates**:
     - Premium: Rs. 95.00/kg
     - Grade A: Rs. 85.00/kg
     - Grade B: Rs. 75.00/kg
     - Grade C: Rs. 65.00/kg
   - **Transport Rate**: Cost per kg (e.g., Rs. 10.00)
   - **Deductions**:
     - Bag Weight: 5% (weight of bags)
     - Water Weight: 3% (moisture content)
     - Coarse Leaf: 2% (poor quality leaves)
4. Click **"Save"**
5. Click **"Activate"** to make it the current rate

**Note**: Only one rate can be active at a time. Creating a new active rate automatically deactivates the old one.

---

### Step 2: Create Collection Routes

**What is this?** Routes are the areas where drivers collect tea leaves from suppliers.

**How to do it:**

1. Go to **Payment Manager** → **Route Management**
2. Click **"Add Route"** button
3. Fill in the form:
   - **Route Number**: e.g., KD-001
   - **Route Name**: e.g., "Kandy Route"
   - **Area**: e.g., "Kandy District"
   - **Description**: Brief description
   - **Collection Days**: Select days (Monday, Wednesday, Friday)
   - **Driver**: (Optional) Assign driver later
   - **Vehicle**: (Optional) Assign vehicle later
4. Click **"Save"**

**Example Routes:**
- KD-001: Kandy Route (Mon, Wed, Fri)
- MT-002: Matale Route (Tue, Thu, Sat)
- NE-003: Nuwara Eliya Route (Mon, Thu)

---

### Step 3: Register Suppliers

**What is this?** Suppliers are farmers who provide tea leaves.

**How to do it:**

1. Go to **Payment Manager** → **Supplier Management**
2. Click **"Add Supplier"** button
3. Fill in the form:

   **Personal Information:**
   - Supplier Code: e.g., SUP001
   - Full Name: John Farmer
   - NIC Number: 123456789V
   - Contact Number: 0771234567
   - Address: 123 Tea Estate Road

   **Route Assignment:**
   - Select Route: Choose from dropdown

   **Bank Details** (for bank payments):
   - Bank Name: Bank of Ceylon
   - Branch Name: Kandy Branch
   - Account Number: 1234567890
   - Account Holder Name: John Farmer

   **Payment Preference:**
   - Select: Bank or Cash

4. Click **"Save"**

**Note**: A user account is automatically created for each supplier.

---

## 📋 Daily Operations

### Recording Tea Leaf Collections

**Who does this?** Data entry staff or route managers

**When?** Daily, after each route collection

**How to do it:**

1. Go to **Tea Leaf Entry** → **Record Collection**
2. Click **"Add Entry"** button
3. Fill in the form:
   - **Date**: Collection date (defaults to today)
   - **Route**: Select route
   - **Supplier**: Select supplier from route
   - **Weight**: Total weight in kg (e.g., 125.5)
   - **Quality**: Select grade (Premium, A, B, C)
   - **Vehicle Number**: e.g., KA-1234
   - **Driver Name**: Driver who collected
   - **Notes**: Any special notes
4. Click **"Save"**

**What happens automatically?**
- Bag weight deducted (5%)
- Water weight deducted (3%)
- Coarse leaf deducted (2%)
- Net weight calculated
- Amount calculated (Net Weight × Rate)

**Example Entry:**
- Gross Weight: 125.5 kg
- Bag Weight: 6.28 kg (5%)
- Water Weight: 3.77 kg (3%)
- Coarse Leaf: 2.51 kg (2%)
- **Net Weight: 112.94 kg**
- Rate: Rs. 85/kg
- **Amount: Rs. 9,599.90**

---

## 💰 Monthly Payment Process

### Overview

At the end of each month, follow these 5 steps:

```
1. Calculate → 2. Review → 3. Approve → 4. Process Bank → 5. Disburse Cash
```

---

### Step 1: Calculate Monthly Payments

**When?** Last day of the month or first day of next month

**How to do it:**

1. Go to **Payment Manager** → **Monthly Payments**
2. Click **"Calculate Payments"** button
3. Select:
   - **Month**: e.g., June
   - **Year**: e.g., 2025
   - **Suppliers**: Leave blank to calculate for all, or select specific suppliers
4. Click **"Calculate"**

**What happens?**
- System collects all tea leaf entries for the month
- Groups by supplier
- Calculates gross amount
- Deducts advances, fertilizer, transport, loans
- Calculates final payment amount

**Wait time**: 10-30 seconds depending on number of suppliers

---

### Step 2: Review Calculated Payments

**Where?** Payment Manager → **Pending Approvals**

**What to check:**

For each supplier, review:
- ✅ Total weight collected
- ✅ Gross amount (before deductions)
- ✅ Deductions breakdown:
  - Advances taken
  - Fertilizer purchases
  - Transport charges
  - Loan installments
  - Other charges
- ✅ Final payment amount
- ✅ Payment method (Bank/Cash)

**Actions:**
- 👁️ **View Details**: See full breakdown
- ✏️ **Edit**: Adjust deductions if needed
- ❌ **Reject**: Cancel payment if issues found

---

### Step 3: Approve Payments

**Who?** Payment Manager or authorized person

**How to do it:**

1. Go to **Pending Approvals** tab
2. Review each payment carefully
3. Select payments to approve:
   - Click checkbox next to each payment, OR
   - Click **"Select All"** for all payments
4. Click **"Approve Selected"** button
5. Confirm approval

**Note**: Once approved, payments move to processing queue.

---

### Step 4: Process Bank Payments

**For**: Suppliers who chose "Bank" payment method

**How to do it:**

1. Go to **Payment Manager** → **Bank Payments**
2. You'll see all approved bank payments in queue
3. Click **"Generate CSV"** button
4. Select payments to include:
   - Filter by date range if needed
   - Select all or specific payments
5. Click **"Generate"**
6. System creates CSV file with:
   - Supplier code
   - Supplier name
   - Account number
   - Bank name
   - Branch name
   - Amount
   - Reference number

7. Click **"Download CSV"**
8. Upload CSV to your bank's payment system
9. Once bank processes payments, mark as **"Completed"**

**CSV Format Example:**
```csv
Supplier Code,Supplier Name,Account Number,Bank Name,Branch Name,Amount,Reference
SUP001,John Farmer,1234567890,Bank of Ceylon,Kandy Branch,75000,PAY-001
SUP002,Mary Silva,2345678901,Commercial Bank,Kandy Branch,82500,PAY-002
```

---

### Step 5: Disburse Cash Payments

**For**: Suppliers who chose "Cash" payment method

**How to do it:**

1. Go to **Payment Manager** → **Cash Payments**
2. Click **"Disburse by Route"**
3. Select route (cash payments grouped by route)
4. Print payment list for that route
5. Prepare cash for each supplier
6. When distributing:
   - Give cash to supplier
   - Get signature on receipt
   - Enter receipt number in system
7. Click **"Mark as Disbursed"**
8. Select all paid suppliers
9. Enter receipt numbers
10. Click **"Confirm Disbursement"**

**Safety Tips:**
- Count cash twice before distribution
- Get signatures for all payments
- Use two people for cash handling
- Store receipts securely

---

## 🏦 Advance Management

### What are Advances?

Advances are early payments given to suppliers before the monthly payment date.

---

### Processing Advance Requests

**How to do it:**

1. Go to **Payment Manager** → **Advances** → **Requested** tab
2. You'll see all pending advance requests
3. For each request, review:
   - Supplier name
   - Amount requested
   - Reason for advance
   - Previous advances (if any)
   - Current month's expected payment
4. Click **"View Details"** to see full information
5. Decide to approve or reject:

**To Approve:**
1. Click **"Approve"** button
2. Enter approved amount (can be less than requested)
3. Add notes if needed
4. Click **"Confirm Approval"**

**To Reject:**
1. Click **"Reject"** button
2. Enter reason for rejection
3. Click **"Confirm Rejection"**

**Note**: Approved advances are automatically deducted from monthly payments.

---

### Creating Advance Request (On Behalf of Supplier)

**If supplier calls and requests advance:**

1. Go to **Advances** → **Create Advance**
2. Fill in the form:
   - Select supplier
   - Enter amount requested
   - Enter reason
   - Add notes
3. Click **"Submit Request"**
4. Request moves to pending approvals
5. Follow approval process above

---

## 📊 Reports and History

### Payment History Report

**What it shows**: All payments made, filtered by various criteria

**How to access:**

1. Go to **Payment Manager** → **Payment History**
2. Set filters:
   - Date range: Start date to End date
   - Supplier: Specific supplier or all
   - Payment type: Monthly, Adhoc, Advance
   - Payment method: Bank, Cash, or all
   - Status: Paid, Pending, Failed
3. Click **"Search"**
4. View results in table
5. Click **"Export"** to download Excel/PDF

---

### Supplier Statement

**What it shows**: Complete payment history for one supplier

**How to access:**

1. Go to **Supplier Management**
2. Click on supplier name
3. Click **"View Statement"** tab
4. You'll see:
   - All tea leaf entries
   - All advances received
   - All payments made
   - Current balance/outstanding
   - Total earnings to date

---

### Monthly Summary Report

**What it shows**: Overview of all payments for a specific month

**How to access:**

1. Go to **Reports** → **Monthly Summary**
2. Select month and year
3. View:
   - Total suppliers paid
   - Total amount paid
   - Payment method breakdown
   - Route-wise breakdown
   - Average payment per supplier
4. Click **"Export PDF"** to print/save

---

### Route Performance Report

**What it shows**: Tea collection and payment data by route

**How to access:**

1. Go to **Reports** → **Route Performance**
2. Select route
3. Select date range
4. View:
   - Total weight collected
   - Number of suppliers
   - Total amount paid
   - Average per supplier
   - Collection frequency

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Payment calculation shows zero

**Possible causes:**
- No tea leaf entries recorded for the month
- Supplier has no entries
- Tea rate not configured

**Solution:**
1. Check if tea leaf entries exist for that month
2. Verify active tea rate is configured
3. Ensure supplier is assigned to correct route

---

#### Issue 2: Deductions are incorrect

**Possible causes:**
- Multiple advances approved
- Fertilizer charges not updated
- Transport rate changed

**Solution:**
1. Go to payment details view
2. Check deductions breakdown
3. Manually adjust if needed before approval
4. Add notes explaining adjustment

---

#### Issue 3: Cannot generate bank CSV

**Possible causes:**
- No payments approved
- Suppliers missing bank details

**Solution:**
1. Ensure payments are approved (not just calculated)
2. Check each supplier has complete bank details:
   - Bank name
   - Branch name
   - Account number
   - Account holder name
3. Update missing information
4. Try generating CSV again

---

#### Issue 4: Payment method is wrong

**Possible causes:**
- Supplier preference changed
- Incorrect initial setup

**Solution:**
1. Go to Supplier Management
2. Edit supplier details
3. Change payment method preference
4. Save changes
5. For this month, manually assign correct method in payment details

---

#### Issue 5: Advance not deducted from payment

**Possible causes:**
- Advance approved after payment calculation
- Advance status not updated

**Solution:**
1. Reject the calculated payment
2. Ensure advance status is "APPROVED"
3. Recalculate payment
4. Advance will now be deducted

---

## 📞 Support and Help

### Need Help?

**For technical issues:**
- Check system health: http://localhost:5000/health
- Restart backend and frontend servers
- Clear browser cache (Ctrl + Shift + R)

**For payment queries:**
- Contact Payment Manager
- Review this manual
- Check payment history for similar cases

**For system errors:**
- Note the error message
- Note what you were doing
- Contact system administrator
- Provide error details

---

## 🎓 Training Checklist

### For New Users

- [ ] Complete login successfully
- [ ] Navigate to Payment Manager
- [ ] View existing tea rates
- [ ] View routes and suppliers
- [ ] Record a tea leaf entry
- [ ] View payment history
- [ ] Review an advance request

### For Payment Managers

- [ ] All items in "For New Users" section
- [ ] Configure a tea rate
- [ ] Create a route
- [ ] Register a supplier
- [ ] Calculate monthly payments
- [ ] Approve payments
- [ ] Generate bank CSV
- [ ] Disburse cash payments
- [ ] Process advance requests
- [ ] Generate reports

---

## 📝 Quick Reference

### Monthly Payment Timeline

| Day | Task |
|-----|------|
| 1-28 | Record daily tea leaf entries |
| 29 | Verify all entries are recorded |
| 30 | Calculate monthly payments |
| 30-31 | Review and approve payments |
| 1 (next month) | Generate bank CSV |
| 1-2 | Upload to bank and disburse cash |
| 3-5 | Confirm all payments completed |

### Important Reminders

✅ **Daily**: Record all tea leaf collections  
✅ **Weekly**: Verify entries are accurate  
✅ **Month-end**: Calculate and approve payments  
✅ **Always**: Keep receipts and documentation  
✅ **Never**: Approve payment without review  

---

## 📄 Appendix: Sample Data

### Sample Tea Rate Configuration

```
Effective Date: 2025-06-01
Default Rate: Rs. 85.00/kg

Quality Rates:
- Premium: Rs. 95.00/kg
- Grade A: Rs. 85.00/kg
- Grade B: Rs. 75.00/kg
- Grade C: Rs. 65.00/kg

Deductions:
- Bag Weight: 5%
- Water Weight: 3%
- Coarse Leaf: 2%
- Transport: Rs. 10.00/kg
```

### Sample Payment Calculation

```
Supplier: John Farmer (SUP001)
Month: June 2025

Tea Collected:
- Total Weight: 1,250.5 kg
- Bag Weight: 62.5 kg (5%)
- Water Weight: 37.5 kg (3%)
- Coarse Leaf: 25.0 kg (2%)
- Net Weight: 1,125.5 kg

Gross Amount:
- 1,125.5 kg × Rs. 85/kg = Rs. 95,667.50

Deductions:
- Advances: Rs. 15,000.00
- Fertilizer: Rs. 3,500.00
- Transport: Rs. 11,255.00 (1,125.5 kg × Rs. 10)
- Loans: Rs. 0.00
- Others: Rs. 800.00
- Total Deductions: Rs. 30,555.00

Final Payment: Rs. 95,667.50 - Rs. 30,555.00 = Rs. 65,112.50
Payment Method: Bank
```

---

**Document Version**: 1.0  
**Last Updated**: March 7, 2026  
**System Version**: Tea Factory Management System v1.0

---

**End of User Manual**

For system administrator documentation, see `PAYMENT_SYSTEM_GUIDE.md`
